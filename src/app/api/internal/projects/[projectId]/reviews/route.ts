import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { listInternalMessagesQuerySchema } from "@/lib/validators/internal-messages";
import type { Prisma } from "@prisma/client";

type RouteContext =
  | { params: Promise<{ projectId: string }> }
  | { params: { projectId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

function serializeReview(row: {
  id: string;
  status: string;
  rating: number;
  title: string | null;
  content: string | null;
  htmlContent: string | null;
  staffReplyContent: string | null;
  staffReplyHtml: string | null;
  staffRepliedAt: Date | null;
  attachments: Prisma.JsonValue | null;
  createdAt: Date;
  page: { url: string; title: string | null };
  commenter: { name: string; provider: string; avatar: string | null };
}) {
  return {
    id: row.id,
    status: row.status,
    rating: row.rating,
    title: row.title,
    content: row.content,
    htmlContent: row.htmlContent,
    staffReplyContent: row.staffReplyContent,
    staffReplyHtml: row.staffReplyHtml,
    staffRepliedAt: row.staffRepliedAt?.toISOString() ?? null,
    attachments: row.attachments,
    createdAt: row.createdAt.toISOString(),
    page: row.page,
    commenter: row.commenter,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    const project = await requireProjectOwned(projectId, ownerId);
    if (normalizeWidgetMode(project.widgetMode) === "comment") {
      return jsonSuccess({ reviews: [], reviewsDisabled: true as const });
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const q = listInternalMessagesQuerySchema.parse(raw);
    const limit = q.limit ?? 50;
    const offset = q.offset ?? 0;

    const where: Prisma.ReviewWhereInput = { projectId };
    if (q.status && q.status !== "all") {
      where.status = q.status;
    }

    const rows = await prisma.review.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: offset,
      include: {
        page: { select: { url: true, title: true } },
        commenter: { select: { name: true, provider: true, avatar: true } },
      },
    });

    return jsonSuccess({
      reviews: rows.map(serializeReview),
      reviewsDisabled: false as const,
    });
  } catch (e) {
    return jsonError(e);
  }
}
