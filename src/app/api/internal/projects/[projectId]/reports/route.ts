import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { listInternalReportsQuerySchema } from "@/lib/validators/internal-reports";
import type { Prisma } from "@prisma/client";

type RouteContext =
  | { params: Promise<{ projectId: string }> }
  | { params: { projectId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

const reportInclude = {
  comment: {
    include: {
      page: { select: { url: true, title: true } },
      commenter: { select: { name: true } },
    },
  },
  review: {
    include: {
      page: { select: { url: true, title: true } },
      commenter: { select: { name: true } },
    },
  },
} as const;

function serializeReport(
  r: Prisma.ReportGetPayload<{ include: typeof reportInclude }>,
) {
  const target = r.commentId
    ? {
        kind: "comment" as const,
        id: r.commentId,
        excerpt: (r.comment?.content ?? "").slice(0, 280),
        status: r.comment?.status ?? "",
        pageUrl: r.comment?.page?.url ?? "",
        pageTitle: r.comment?.page?.title ?? "",
        authorName: r.comment?.commenter?.name ?? "Unknown",
      }
    : r.reviewId
      ? {
          kind: "review" as const,
          id: r.reviewId,
          excerpt:
            (r.review?.title ? `${r.review.title}\n` : "") +
            (r.review?.content ?? "").slice(0, 280),
          status: r.review?.status ?? "",
          pageUrl: r.review?.page?.url ?? "",
          pageTitle: r.review?.page?.title ?? "",
          authorName: r.review?.commenter?.name ?? "Unknown",
        }
      : null;

  return {
    id: r.id,
    status: r.status,
    reason: r.reason,
    description: r.description,
    reporterIp: r.reporterIp,
    createdAt: r.createdAt.toISOString(),
    target,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);

    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const q = listInternalReportsQuerySchema.parse(raw);
    const limit = q.limit ?? 50;
    const offset = q.offset ?? 0;

    const whereReport: Prisma.ReportWhereInput = {
      OR: [{ comment: { projectId } }, { review: { projectId } }],
    };
    if (q.status && q.status !== "all") {
      whereReport.status = q.status;
    }

    const total = await prisma.report.count({ where: whereReport });

    const rows = await prisma.report.findMany({
      where: whereReport,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: offset,
      include: reportInclude,
    });

    return jsonSuccess({
      reports: rows.map(serializeReport),
      total,
      limit,
      offset,
    });
  } catch (e) {
    return jsonError(e);
  }
}
