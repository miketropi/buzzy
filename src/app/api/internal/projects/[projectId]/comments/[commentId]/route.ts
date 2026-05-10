import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned, isUuid } from "@/lib/internal/project-access";
import { writeModerationAuditLog } from "@/lib/internal/moderation-audit";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { patchMessageStatusBodySchema } from "@/lib/validators/internal-messages";
import type { Prisma } from "@prisma/client";

type RouteContext =
  | { params: Promise<{ projectId: string; commentId: string }> }
  | { params: { projectId: string; commentId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

function serializeComment(row: {
  id: string;
  status: string;
  content: string;
  htmlContent: string | null;
  attachments: Prisma.JsonValue | null;
  parentId: string | null;
  depth: number;
  createdAt: Date;
  page: { url: string; title: string | null };
  commenter: { name: string; provider: string; avatar: string | null };
}) {
  return {
    id: row.id,
    status: row.status,
    content: row.content,
    htmlContent: row.htmlContent,
    attachments: row.attachments,
    parentId: row.parentId,
    depth: row.depth,
    createdAt: row.createdAt.toISOString(),
    page: row.page,
    commenter: row.commenter,
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId, commentId } = await getParams(context);
    const project = await requireProjectOwned(projectId, ownerId);
    if (normalizeWidgetMode(project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }
    if (!isUuid(commentId)) {
      throw new NotFoundError("Comment not found");
    }

    const patch = patchMessageStatusBodySchema.parse(await request.json());
    const existing = await prisma.comment.findFirst({
      where: { id: commentId, projectId },
      select: { id: true, status: true },
    });
    if (!existing) {
      throw new NotFoundError("Comment not found");
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { status: patch.status },
      include: {
        page: { select: { url: true, title: true } },
        commenter: { select: { name: true, provider: true, avatar: true } },
      },
    });

    await writeModerationAuditLog({
      projectId,
      actorUserId: ownerId,
      action: `comment_${patch.status}`,
      entityType: "comment",
      entityId: commentId,
      details: { from: existing.status, to: patch.status },
    });

    return jsonSuccess({ comment: serializeComment(updated) });
  } catch (e) {
    return jsonError(e);
  }
}
