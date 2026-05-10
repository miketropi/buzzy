import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/internal/project-access";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { COMMENT_EDIT_WINDOW_MS } from "@/lib/public-api/comment-edit-policy";
import { attachmentsFromDb } from "@/lib/public-api/attachments";
import { runPublicApi } from "@/lib/public-api/handler";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { assertRequestActsAsCommenter } from "@/lib/public-api/resolve-session-commenter";
import { sanitizeCommentContent, sanitizeCommentHtml } from "@/lib/public-api/sanitize-content";
import {
  assertNoRecentDuplicateComment,
  duplicateBodyFingerprint,
} from "@/lib/public-api/content-duplicate";
import { getSpamBlockReasonForText } from "@/lib/public-api/spam";
import { singlePublicComment } from "@/lib/public-api/serialize-comment";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { patchCommentBodySchema } from "@/lib/validators/comment";

const EDIT_WINDOW_MS = COMMENT_EDIT_WINDOW_MS;

type RouteCtx =
  | { params: Promise<{ commentId: string }> }
  | { params: { commentId: string } };

async function getParams(context: RouteCtx) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function PATCH(request: NextRequest, context: RouteCtx) {
  return runPublicApi(request, async (ctx) => {
    const { commentId } = await getParams(context);
    if (!isUuid(commentId)) {
      throw new NotFoundError("Comment not found");
    }

    if (normalizeWidgetMode(ctx.project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }

    const body = patchCommentBodySchema.parse(await request.json());

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, projectId: ctx.project.id },
    });
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }
    if (comment.status === "deleted") {
      throw new ForbiddenError("Comment was deleted");
    }

    const settings = getEffectiveSettings(ctx.project.settings);

    await assertRequestActsAsCommenter(ctx.request, ctx.project, settings, comment.commenterId);

    if (Date.now() - comment.createdAt.getTime() > EDIT_WINDOW_MS) {
      throw new ForbiddenError("Edit window has expired");
    }

    const contentIn = body.content;
    const htmlIn = body.html;

    let htmlContent: string | null;
    if (htmlIn !== undefined) {
      const htmlSan = htmlIn.trim() ? sanitizeCommentHtml(htmlIn) : "";
      htmlContent = htmlSan.length > 0 ? htmlSan : null;
    } else {
      htmlContent = null;
    }

    const plainFromText = contentIn !== undefined ? sanitizeCommentContent(contentIn) : "";
    const plainFromHtml = htmlIn !== undefined && htmlIn.trim() ? sanitizeCommentContent(htmlIn) : "";

    let content = (plainFromText || plainFromHtml).trim();
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
    const existingAttachments = attachmentsFromDb(comment.attachments);
    if (!content && existingAttachments.length > 0) {
      content = "(attachments)";
    }
    if (!content) {
      throw new ValidationError("Content is empty after sanitization");
    }

    const spamProbe = `${content}\n${htmlContent ?? ""}`;
    const spamReason = getSpamBlockReasonForText(spamProbe, settings);
    if (spamReason) {
      throw new ValidationError(spamReason);
    }

    const dupWindow =
      typeof settings.spamDuplicateWindowSeconds === "number" &&
      Number.isFinite(settings.spamDuplicateWindowSeconds)
        ? Math.min(604800, Math.max(0, Math.floor(settings.spamDuplicateWindowSeconds)))
        : 0;
    const dupHash = duplicateBodyFingerprint(content);
    await assertNoRecentDuplicateComment({
      projectId: ctx.project.id,
      pageId: comment.pageId,
      fingerprint: dupHash,
      windowSeconds: dupWindow,
      excludeCommentId: commentId,
    });

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content, htmlContent, editedAt: new Date(), duplicateBodyHash: dupHash || null },
      include: { commenter: { select: { name: true, avatar: true } } },
    });

    return jsonSuccess({ comment: singlePublicComment(updated, updated.commenterId) });
  });
}

export async function DELETE(request: NextRequest, context: RouteCtx) {
  return runPublicApi(request, async (ctx) => {
    const { commentId } = await getParams(context);
    if (!isUuid(commentId)) {
      throw new NotFoundError("Comment not found");
    }

    if (normalizeWidgetMode(ctx.project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, projectId: ctx.project.id },
    });
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    await assertRequestActsAsCommenter(ctx.request, ctx.project, settings, comment.commenterId);

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: "[deleted]",
        status: "deleted",
        editedAt: new Date(),
        htmlContent: null,
      },
    });

    return jsonSuccess({ deleted: true });
  });
}
