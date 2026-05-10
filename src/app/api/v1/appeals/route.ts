import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { runPublicApi } from "@/lib/public-api/handler";
import { assertAppealRateLimit } from "@/lib/public-api/rate-limit-request";
import { NotFoundError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { appealCreateBodySchema } from "@/lib/validators/appeal";

export async function POST(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    await assertAppealRateLimit(request);
    const body = appealCreateBodySchema.parse(await request.json());
    const email = body.email?.trim() ? body.email.trim() : null;

    if (body.comment_id) {
      const row = await prisma.comment.findFirst({
        where: { id: body.comment_id, projectId: ctx.project.id, status: { not: "deleted" } },
        select: { id: true },
      });
      if (!row) {
        throw new NotFoundError("Comment not found");
      }
      await prisma.appeal.create({
        data: {
          projectId: ctx.project.id,
          commentId: body.comment_id,
          email,
          message: body.message.trim(),
        },
      });
      return jsonSuccess({ ok: true });
    }

    const reviewId = body.review_id;
    if (!reviewId) {
      throw new NotFoundError("Review not found");
    }

    const r = await prisma.review.findFirst({
      where: { id: reviewId, projectId: ctx.project.id, status: { not: "deleted" } },
      select: { id: true },
    });
    if (!r) {
      throw new NotFoundError("Review not found");
    }

    await prisma.appeal.create({
      data: {
        projectId: ctx.project.id,
        reviewId,
        email,
        message: body.message.trim(),
      },
    });

    return jsonSuccess({ ok: true });
  });
}
