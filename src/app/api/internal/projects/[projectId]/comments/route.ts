import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned, isUuid } from "@/lib/internal/project-access";
import { getOrCreateStaffCommenter } from "@/lib/internal/staff-commenter";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { sanitizeCommentContent, sanitizeCommentHtml } from "@/lib/public-api/sanitize-content";
import { matchesSpamPatterns } from "@/lib/public-api/spam";
import { submitterIpFromRequest } from "@/lib/public-api/rate-limit-request";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import {
  listInternalMessagesQuerySchema,
  staffReplyCommentBodySchema,
} from "@/lib/validators/internal-messages";
import type { Prisma } from "@prisma/client";

type RouteContext =
  | { params: Promise<{ projectId: string }> }
  | { params: { projectId: string } };

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
  submitterIp: string | null;
  parentId: string | null;
  depth: number;
  upvotes: number;
  downvotes: number;
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
    content: row.content,
    htmlContent: row.htmlContent,
    attachments: row.attachments,
    submitterIp: row.submitterIp,
    parentId: row.parentId,
    depth: row.depth,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
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
    if (normalizeWidgetMode(project.widgetMode) === "review") {
      return jsonSuccess({ comments: [], commentsDisabled: true as const });
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const q = listInternalMessagesQuerySchema.parse(raw);
    const limit = q.limit ?? 50;
    const offset = q.offset ?? 0;

    const where: Prisma.CommentWhereInput = { projectId };
    if (q.status && q.status !== "all") {
      where.status = q.status;
    }

    const rows = await prisma.comment.findMany({
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
      comments: rows.map(serializeComment),
      commentsDisabled: false as const,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    const project = await requireProjectOwned(projectId, ownerId);
    if (normalizeWidgetMode(project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }

    const body = staffReplyCommentBodySchema.parse(await request.json());
    const parent = await prisma.comment.findFirst({
      where: { id: body.parent_id, projectId },
      include: { page: true },
    });
    if (!parent || parent.status === "deleted") {
      throw new NotFoundError("Comment not found");
    }

    const settings = getEffectiveSettings(project.settings);
    if (!settings.enableReplies) {
      throw new ForbiddenError("Replies are disabled for this project");
    }
    if (parent.depth >= settings.maxDepth) {
      throw new ForbiddenError("Maximum thread depth reached");
    }

    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, name: true, avatar: true },
    });
    if (!user) {
      throw new UnauthorizedError();
    }

    let htmlContent: string | null = null;
    if (body.html?.trim()) {
      const html = sanitizeCommentHtml(body.html);
      htmlContent = html.length > 0 ? html : null;
    }

    let content = (body.content ? sanitizeCommentContent(body.content) : "").trim();
    const plainFromHtml = body.html ? sanitizeCommentContent(body.html) : "";
    if (!content && plainFromHtml) {
      content = plainFromHtml.trim();
    }
    if (!content && htmlContent) {
      const stripped = sanitizeCommentContent(htmlContent);
      content = stripped.length > 0 ? stripped : "";
    }
    if (!content && htmlContent && /<img[\s>]/i.test(htmlContent)) {
      content = "(image)";
    }
    if (!content && htmlContent && /<video[\s>]/i.test(htmlContent)) {
      content = "(video)";
    }
    if (!content) {
      throw new ValidationError("Content is empty after sanitization");
    }

    const spamProbe = `${content}\n${htmlContent ?? ""}`;
    if (matchesSpamPatterns(spamProbe, settings)) {
      throw new ValidationError("This message was blocked by the spam filter");
    }

    const commenter = await getOrCreateStaffCommenter(projectId, user);
    const comment = await prisma.comment.create({
      data: {
        projectId,
        pageId: parent.pageId,
        commenterId: commenter.id,
        parentId: parent.id,
        content,
        htmlContent,
        status: "approved",
        depth: parent.depth + 1,
        submitterIp: submitterIpFromRequest(request),
      },
      include: {
        page: { select: { url: true, title: true } },
        commenter: {
          select: { name: true, email: true, externalId: true, provider: true, avatar: true },
        },
      },
    });

    return jsonSuccess({ comment: serializeComment(comment) });
  } catch (e) {
    return jsonError(e);
  }
}
