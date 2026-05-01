import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/internal/project-access";
import { runPublicApi } from "@/lib/public-api/handler";
import { assertReportRateLimit, clientIp } from "@/lib/public-api/rate-limit-request";
import { NotFoundError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { reportReviewBodySchema } from "@/lib/validators/review";

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

    await assertReportRateLimit(request);

    const body = reportReviewBodySchema.parse(await request.json());

    const review = await prisma.review.findFirst({
      where: { id: reviewId, projectId: ctx.project.id },
    });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    await prisma.report.create({
      data: {
        reviewId,
        reason: body.reason,
        description: body.description ?? null,
        reporterIp: clientIp(request),
      },
    });

    return jsonSuccess({ reported: true });
  });
}
