import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/internal/project-access";
import { runPublicApi } from "@/lib/public-api/handler";
import { assertReportRateLimit, clientIp } from "@/lib/public-api/rate-limit-request";
import { NotFoundError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { reportCommentBodySchema } from "@/lib/validators/comment";

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

    await assertReportRateLimit(request);

    const body = reportCommentBodySchema.parse(await request.json());

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, projectId: ctx.project.id },
    });
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    await prisma.report.create({
      data: {
        commentId,
        reason: body.reason,
        description: body.description ?? null,
        reporterIp: clientIp(request),
      },
    });

    return jsonSuccess({ reported: true });
  });
}
