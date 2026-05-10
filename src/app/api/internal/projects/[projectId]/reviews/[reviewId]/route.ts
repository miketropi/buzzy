import type { NextRequest } from "next/server";

import { isUuid, requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { prisma } from "@/lib/prisma";
import { recalculatePageRatingSummary } from "@/lib/public-api/rating-summary";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { getSpamBlockReasonForText } from "@/lib/public-api/spam";
import { sanitizeCommentContent, sanitizeCommentHtml } from "@/lib/public-api/sanitize-content";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { patchReviewAdminBodySchema } from "@/lib/validators/internal-messages";
import type { Prisma } from "@prisma/client";

type RouteContext =
  | { params: Promise<{ projectId: string; reviewId: string }> }
  | { params: { projectId: string; reviewId: string } };

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId, reviewId } = await getParams(context);
    const project = await requireProjectOwned(projectId, ownerId);
    if (normalizeWidgetMode(project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }
    if (!isUuid(reviewId)) {
      throw new NotFoundError("Review not found");
    }

    const patch = patchReviewAdminBodySchema.parse(await request.json());
    const existing = await prisma.review.findFirst({
      where: { id: reviewId, projectId },
    });
    if (!existing) {
      throw new NotFoundError("Review not found");
    }

    const settings = getEffectiveSettings(project.settings);
    const data: Prisma.ReviewUpdateInput = {};

    if (patch.clearStaffReply) {
      data.staffReplyContent = null;
      data.staffReplyHtml = null;
      data.staffRepliedAt = null;
    }

    if (patch.status !== undefined) {
      data.status = patch.status;
    }

    if (
      !patch.clearStaffReply &&
      (patch.staffReplyContent !== undefined || patch.staffReplyHtml !== undefined)
    ) {
      let htmlContent: string | null = null;
      if (patch.staffReplyHtml?.trim()) {
        const html = sanitizeCommentHtml(patch.staffReplyHtml);
        htmlContent = html.length > 0 ? html : null;
      }

      let plain =
        patch.staffReplyContent !== undefined
          ? sanitizeCommentContent(patch.staffReplyContent).trim()
          : "";
      const plainFromHtml = patch.staffReplyHtml
        ? sanitizeCommentContent(patch.staffReplyHtml).trim()
        : "";
      if (!plain && plainFromHtml) {
        plain = plainFromHtml;
      }
      if (!plain && htmlContent) {
        const stripped = sanitizeCommentContent(htmlContent);
        plain = stripped.length > 0 ? stripped : "";
      }
      if (!plain && htmlContent && /<img[\s>]/i.test(htmlContent)) {
        plain = "(image)";
      }
      if (!plain && htmlContent && /<video[\s>]/i.test(htmlContent)) {
        plain = "(video)";
      }
      if (!plain && !htmlContent) {
        throw new ValidationError("Staff reply is empty after sanitization");
      }

      const spamProbe = `${plain}\n${htmlContent ?? ""}`;
      const spamReason = getSpamBlockReasonForText(spamProbe, settings);
      if (spamReason) {
        throw new ValidationError(spamReason);
      }

      data.staffReplyContent = plain;
      data.staffReplyHtml = htmlContent;
      data.staffRepliedAt = new Date();
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        page: { select: { url: true, title: true } },
        commenter: { select: { name: true, provider: true, avatar: true } },
      },
    });

    if (patch.status !== undefined) {
      await recalculatePageRatingSummary(updated.pageId, settings.ratingScale);
    }

    return jsonSuccess({ review: serializeReview(updated) });
  } catch (e) {
    return jsonError(e);
  }
}
