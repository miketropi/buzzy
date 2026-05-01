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
  | { params: Promise<{ commentId: string }> }
  | { params: { commentId: string } };

async function getParams(context: RouteCtx) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function POST(request: NextRequest, context: RouteCtx) {
  return runPublicApi(request, async (ctx) => {
    const { commentId } = await getParams(context);
    if (!isUuid(commentId)) {
      throw new NotFoundError("Comment not found");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    if (!settings.enableVoting) {
      throw new ForbiddenError("Voting is disabled for this project");
    }

    if (normalizeWidgetMode(ctx.project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }

    const commenterIdSession = await resolveSessionCommenterId(request, ctx.project, settings);
    if (!commenterIdSession) {
      throw new ForbiddenError("Commenter token or valid host identity is required");
    }

    await assertVoteRateLimit(request);

    const body = voteBodySchema.parse(await request.json());

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        projectId: ctx.project.id,
        status: "approved",
      },
    });
    if (!comment) {
      throw new NotFoundError("Comment not found");
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
        where: { commentId, commenterId },
      });

      if (body.value === 0) {
        if (!existing) return;
        await tx.vote.delete({ where: { id: existing.id } });
        if (existing.value === 1) {
          await tx.comment.update({
            where: { id: commentId },
            data: { upvotes: { decrement: 1 } },
          });
        } else {
          await tx.comment.update({
            where: { id: commentId },
            data: { downvotes: { decrement: 1 } },
          });
        }
        return;
      }

      if (!existing) {
        await tx.vote.create({
          data: { commentId, commenterId, value: body.value },
        });
        if (body.value === 1) {
          await tx.comment.update({
            where: { id: commentId },
            data: { upvotes: { increment: 1 } },
          });
        } else {
          await tx.comment.update({
            where: { id: commentId },
            data: { downvotes: { increment: 1 } },
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
        await tx.comment.update({
          where: { id: commentId },
          data: { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
        });
      } else if (existing.value === -1 && body.value === 1) {
        await tx.comment.update({
          where: { id: commentId },
          data: { upvotes: { increment: 1 }, downvotes: { decrement: 1 } },
        });
      }
    });

    const next = await prisma.comment.findFirst({
      where: { id: commentId },
      select: { upvotes: true, downvotes: true },
    });
    if (!next) {
      throw new NotFoundError("Comment not found");
    }

    const voteRow = await prisma.vote.findFirst({
      where: { commentId, commenterId },
    });

    return jsonSuccess({
      upvotes: next.upvotes,
      downvotes: next.downvotes,
      your_vote: voteRow?.value ?? 0,
    });
  });
}
