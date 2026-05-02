import type { NextRequest } from "next/server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createCommenterToken } from "@/lib/public-api/commenter-token";
import { listCommentsForPage } from "@/lib/public-api/comment-queries";
import { findOrCreatePage, findPageByProjectAndUrl } from "@/lib/public-api/page";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import {
  assertCommentPostRateLimit,
  clientIp,
  submitterIpFromRequest,
} from "@/lib/public-api/rate-limit-request";
import { resolveAnonymousCommenterId } from "@/lib/public-api/resolve-anonymous-commenter";
import { resolveSessionCommenterId } from "@/lib/public-api/resolve-session-commenter";
import { runPublicApi } from "@/lib/public-api/handler";
import {
  assertAttachmentsFromR2,
  attachmentsSpamProbe,
} from "@/lib/public-api/attachments";
import { sanitizeCommentContent, sanitizeCommentHtml } from "@/lib/public-api/sanitize-content";
import {
  isBlockedIp,
  matchesSpamPatterns,
} from "@/lib/public-api/spam";
import {
  applyYourVotesToTree,
  collectCommentIdsFromTree,
  nestPublicComments,
  singlePublicComment,
} from "@/lib/public-api/serialize-comment";
import { isUuid } from "@/lib/internal/project-access";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { ForbiddenError, ValidationError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { clampLimit } from "@/lib/utils/pagination";
import {
  createCommentBodySchema,
  listCommentsQuerySchema,
} from "@/lib/validators/comment";

export async function GET(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    if (normalizeWidgetMode(ctx.project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const q = listCommentsQuerySchema.parse(raw);
    const page = await findPageByProjectAndUrl(ctx.project.id, q.page_url);

    if (!page) {
      return jsonSuccess({ comments: [] }, { hasMore: false });
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    const limit = clampLimit(q.limit, 20, 50);
    const { roots, flatReplies, nextCursor, hasMore } = await listCommentsForPage({
      pageId: page.id,
      sort: q.sort,
      cursor: q.cursor,
      limit,
    });

    const sessionCommenterId = await resolveSessionCommenterId(request, ctx.project, settings);
    const nested = nestPublicComments(roots, flatReplies, sessionCommenterId);
    if (sessionCommenterId) {
      const ids = collectCommentIdsFromTree(nested);
      if (ids.length) {
        const votes = await prisma.vote.findMany({
          where: { commenterId: sessionCommenterId, commentId: { in: ids } },
          select: { commentId: true, value: true },
        });
        const m = new Map<string, number>();
        for (const v of votes) {
          if (v.commentId) m.set(v.commentId, v.value);
        }
        applyYourVotesToTree(nested, m);
      }
    }
    return jsonSuccess(
      { comments: nested },
      { cursor: nextCursor, hasMore },
    );
  });
}

export async function POST(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    if (normalizeWidgetMode(ctx.project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }

    const settings = getEffectiveSettings(ctx.project.settings);

    await assertCommentPostRateLimit(request);

    const body = createCommentBodySchema.parse(await request.json());
    const attachmentList = body.attachments ?? [];
    assertAttachmentsFromR2(attachmentList);
    if (attachmentList.length > 0 && !settings.enableAttachments) {
      throw new ValidationError("Attachments are disabled for this project");
    }

    const ip = clientIp(request);
    if (isBlockedIp(ip, settings.blockedIPs)) {
      throw new ForbiddenError("Access denied");
    }

    const plainFromText = sanitizeCommentContent(body.content ?? "");
    const plainFromHtml = body.html ? sanitizeCommentContent(body.html) : "";
    const spamProbe = `${plainFromText}\n${plainFromHtml}\n${attachmentsSpamProbe(attachmentList)}`;
    if (matchesSpamPatterns(spamProbe, settings)) {
      throw new ValidationError("This message was blocked by the spam filter");
    }

    let htmlContent: string | null = null;
    if (body.html?.trim()) {
      const html = sanitizeCommentHtml(body.html);
      htmlContent = html.length > 0 ? html : null;
    }

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
    if (!content && attachmentList.length > 0) {
      content = "(attachments)";
    }
    if (!content) {
      throw new ValidationError("Content is empty after sanitization");
    }

    const page = await findOrCreatePage(ctx.project.id, body.page_url, body.page_title);

    let parentId: string | null = null;
    let depth = 0;

    if (body.parent_id) {
      if (!isUuid(body.parent_id)) {
        throw new ValidationError("Invalid parent_id");
      }
      if (!settings.enableReplies) {
        throw new ForbiddenError("Replies are disabled");
      }
      const parent = await prisma.comment.findFirst({
        where: {
          id: body.parent_id,
          pageId: page.id,
          projectId: ctx.project.id,
        },
      });
      if (!parent || parent.status !== "approved") {
        throw new ValidationError("Invalid parent_id");
      }
      if (parent.depth >= settings.maxDepth) {
        throw new ForbiddenError("Maximum thread depth reached");
      }
      parentId = parent.id;
      depth = parent.depth + 1;
    }

    const commenterId = await resolveAnonymousCommenterId(ctx, body, settings);

    const status = settings.requireApproval ? "pending" : "approved";

    const comment = await prisma.comment.create({
      data: {
        projectId: ctx.project.id,
        pageId: page.id,
        commenterId,
        parentId,
        content,
        htmlContent,
        attachments: attachmentList.length > 0 ? (attachmentList as Prisma.InputJsonValue) : undefined,
        status,
        depth,
        submitterIp: submitterIpFromRequest(request),
      },
      include: {
        commenter: { select: { name: true, avatar: true } },
      },
    });

    const commenterToken = createCommenterToken(commenterId, ctx.project.id);

    return jsonSuccess({
      comment: singlePublicComment(comment, comment.commenterId),
      commenter_token: commenterToken,
    });
  });
}
