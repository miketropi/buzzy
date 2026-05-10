import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";

type RouteContext =
  | { params: Promise<{ projectId: string }> }
  | { params: { projectId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

function serializeAppeal(row: {
  id: string;
  commentId: string | null;
  reviewId: string | null;
  email: string | null;
  message: string;
  status: string;
  reviewedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    comment_id: row.commentId,
    review_id: row.reviewId,
    email: row.email,
    message: row.message,
    status: row.status,
    reviewed_at: row.reviewedAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);

    const rows = await prisma.appeal.findMany({
      where: { projectId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
    });

    return jsonSuccess({ appeals: rows.map(serializeAppeal) });
  } catch (e) {
    return jsonError(e);
  }
}
