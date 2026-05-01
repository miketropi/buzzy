import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/internal/project-access";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { resolveSessionCommenterId } from "@/lib/public-api/resolve-session-commenter";
import { runPublicApi } from "@/lib/public-api/handler";
import { assertVoteRateLimit } from "@/lib/public-api/rate-limit-request";
import { ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { voteBodySchema } from "@/lib/validators/comment";

type RouteCtx =
  | { params: Promise<{ reviewId: string }> }
  | { params: { reviewId: string } };

async function getParams(context: RouteCtx) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function POST(request: NextRequest, context: RouteCtx) {
  return runPublicApi(request, async (ctx) => {
    const { reviewId } = await getParams(context);
    if (!isUuid(reviewId)) {
      throw new NotFoundError("Review not found");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    if (!settings.enableVoting) {
      throw new ForbiddenError("Voting is disabled for this project");
    }

    if (normalizeWidgetMode(ctx.project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }

    const commenterIdSession = await resolveSessionCommenterId(request, ctx.project, settings);
    if (!commenterIdSession) {
      throw new ForbiddenError("Commenter token or valid host identity is required");
    }

    await assertVoteRateLimit(request);

    const body = voteBodySchema.parse(await request.json());

    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        projectId: ctx.project.id,
        status: "approved",
      },
    });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    const commenterRow = await prisma.commenter.findFirst({
      where: { id: commenterIdSession, projectId: ctx.project.id },
    });
    if (!commenterRow || commenterRow.isBanned) {
      throw new ForbiddenError();
    }

    const commenterId = commenterRow.id;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.vote.findFirst({
        where: { reviewId, commenterId },
      });

      if (body.value === 0) {
        if (!existing) return;
        await tx.vote.delete({ where: { id: existing.id } });
        if (existing.value === 1) {
          await tx.review.update({
            where: { id: reviewId },
            data: { helpfulCount: { decrement: 1 } },
          });
        } else {
          await tx.review.update({
            where: { id: reviewId },
            data: { unhelpfulCount: { decrement: 1 } },
          });
        }
        return;
      }

      if (!existing) {
        await tx.vote.create({
          data: { reviewId, commenterId, value: body.value },
        });
        if (body.value === 1) {
          await tx.review.update({
            where: { id: reviewId },
            data: { helpfulCount: { increment: 1 } },
          });
        } else {
          await tx.review.update({
            where: { id: reviewId },
            data: { unhelpfulCount: { increment: 1 } },
          });
        }
        return;
      }

      if (existing.value === body.value) {
        return;
      }

      await tx.vote.update({
        where: { id: existing.id },
        data: { value: body.value },
      });

      if (existing.value === 1 && body.value === -1) {
        await tx.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { decrement: 1 }, unhelpfulCount: { increment: 1 } },
        });
      } else if (existing.value === -1 && body.value === 1) {
        await tx.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 }, unhelpfulCount: { decrement: 1 } },
        });
      }
    });

    const next = await prisma.review.findFirst({
      where: { id: reviewId },
      select: { helpfulCount: true, unhelpfulCount: true },
    });
    if (!next) {
      throw new NotFoundError("Review not found");
    }

    const voteRow = await prisma.vote.findFirst({
      where: { reviewId, commenterId },
    });

    return jsonSuccess({
      helpful_count: next.helpfulCount,
      unhelpful_count: next.unhelpfulCount,
      your_vote: voteRow?.value ?? 0,
    });
  });
}
