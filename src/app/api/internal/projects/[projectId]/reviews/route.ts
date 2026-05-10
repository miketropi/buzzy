import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { reviewInboxWhere, inboxSearchTrimmed } from "@/lib/internal/messages-inbox-query";
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
  categoryRatings: Prisma.JsonValue | null;
  title: string | null;
  content: string | null;
  htmlContent: string | null;
  staffReplyContent: string | null;
  staffReplyHtml: string | null;
  staffRepliedAt: Date | null;
  attachments: Prisma.JsonValue | null;
  submitterIp: string | null;
  isVerified: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  isPinned: boolean;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  page: { url: string; title: string | null };
  commenter: {
    name: string;
    email: string | null;
    externalId: string | null;
    provider: string;
    avatar: string | null;
  };
}) {
  return {
    id: row.id,
    status: row.status,
    rating: row.rating,
    categoryRatings: row.categoryRatings,
    title: row.title,
    content: row.content,
    htmlContent: row.htmlContent,
    staffReplyContent: row.staffReplyContent,
    staffReplyHtml: row.staffReplyHtml,
    staffRepliedAt: row.staffRepliedAt?.toISOString() ?? null,
    attachments: row.attachments,
    submitterIp: row.submitterIp,
    isVerified: row.isVerified,
    helpfulCount: row.helpfulCount,
    unhelpfulCount: row.unhelpfulCount,
    isPinned: row.isPinned,
    editedAt: row.editedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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
      return jsonSuccess({
        reviews: [],
        reviewsDisabled: true as const,
        total: 0,
        limit: 50,
        offset: 0,
      });
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const q = listInternalMessagesQuerySchema.parse(raw);
    const limit = q.limit ?? 50;
    const offset = q.offset ?? 0;
    const search = inboxSearchTrimmed(q.q);
    const where = reviewInboxWhere(projectId, q.status, search);

    const total = await prisma.review.count({ where });

    const rows = await prisma.review.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: offset,
      include: {
        page: { select: { url: true, title: true } },
        commenter: {
          select: { name: true, email: true, externalId: true, provider: true, avatar: true },
        },
      },
    });

    return jsonSuccess({
      reviews: rows.map(serializeReview),
      reviewsDisabled: false as const,
      total,
      limit,
      offset,
    });
  } catch (e) {
    return jsonError(e);
  }
}
