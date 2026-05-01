import type { NextRequest } from "next/server";

import { Prisma } from "@prisma/client";

import { createCommenterToken } from "@/lib/public-api/commenter-token";
import { findOrCreatePage, findPageByProjectAndUrl } from "@/lib/public-api/page";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import {
  assertReviewPostRateLimit,
  clientIp,
} from "@/lib/public-api/rate-limit-request";
import { recalculatePageRatingSummary } from "@/lib/public-api/rating-summary";
import {
  parseCategoryRatingsForCreate,
} from "@/lib/public-api/review-categories";
import { listReviewsForPage } from "@/lib/public-api/review-queries";
import { createOrReviveReview } from "@/lib/public-api/review-write";
import { resolveAnonymousCommenterId } from "@/lib/public-api/resolve-anonymous-commenter";
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
import { singlePublicReview } from "@/lib/public-api/serialize-review";
import { ForbiddenError, ValidationError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { clampLimit } from "@/lib/utils/pagination";
import {
  createReviewBodySchema,
  listReviewsQuerySchema,
} from "@/lib/validators/review";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";

export async function GET(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    if (normalizeWidgetMode(ctx.project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    if (!settings.enableRating) {
      throw new ForbiddenError("Ratings are disabled for this project");
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const q = listReviewsQuerySchema.parse(raw);
    const page = await findPageByProjectAndUrl(ctx.project.id, q.page_url);

    if (!page) {
      return jsonSuccess({ reviews: [] }, { hasMore: false });
    }

    const scale = settings.ratingScale;
    if (q.rating !== undefined && (q.rating < 1 || q.rating > scale)) {
      throw new ValidationError(`Rating filter must be between 1 and ${scale}`);
    }

    const limit = clampLimit(q.limit, 20, 50);
    const { rows, nextCursor, hasMore } = await listReviewsForPage({
      pageId: page.id,
      projectId: ctx.project.id,
      sort: q.sort,
      ratingFilter: q.rating,
      cursor: q.cursor,
      limit,
    });

    return jsonSuccess(
      { reviews: rows.map((r) => singlePublicReview(r)) },
      { cursor: nextCursor, hasMore },
    );
  });
}

export async function POST(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    if (normalizeWidgetMode(ctx.project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    if (!settings.enableRating) {
      throw new ForbiddenError("Ratings are disabled for this project");
    }

    await assertReviewPostRateLimit(request);

    const body = createReviewBodySchema.parse(await request.json());
    const attachmentList = body.attachments ?? [];
    assertAttachmentsFromR2(attachmentList);
    if (attachmentList.length > 0 && !settings.enableAttachments) {
      throw new ValidationError("Attachments are disabled for this project");
    }

    const scale = settings.ratingScale;
    if (body.rating < 1 || body.rating > scale) {
      throw new ValidationError(`Rating must be between 1 and ${scale}`);
    }

    const ip = clientIp(request);
    if (isBlockedIp(ip, settings.blockedIPs)) {
      throw new ForbiddenError("Access denied");
    }

    const title = body.title ? sanitizeCommentContent(body.title).slice(0, 200) : null;

    const plainFromText = body.content ? sanitizeCommentContent(body.content) : "";
    const plainFromHtml = body.html ? sanitizeCommentContent(body.html) : "";
    const spamProbe = `${title ?? ""}\n${plainFromText}\n${plainFromHtml}\n${attachmentsSpamProbe(attachmentList)}`;
    if (matchesSpamPatterns(spamProbe, settings)) {
      throw new ValidationError("This message was blocked by the spam filter");
    }

    let htmlContent: string | null = null;
    if (body.html?.trim()) {
      const html = sanitizeCommentHtml(body.html);
      htmlContent = html.length > 0 ? html : null;
    }

    let content: string | null = (plainFromText || plainFromHtml).trim() || null;
    if (!content && htmlContent) {
      const stripped = sanitizeCommentContent(htmlContent);
      content = stripped.length > 0 ? stripped : null;
    }
    if (!content && htmlContent && /<img[\s>]/i.test(htmlContent)) {
      content = "(image)";
    }
    if (!content && htmlContent && /<video[\s>]/i.test(htmlContent)) {
      content = "(video)";
    }

    if (settings.requireRatingText && !content && !htmlContent && attachmentList.length === 0) {
      throw new ValidationError("Review text is required");
    }

    const categoryRatings = parseCategoryRatingsForCreate(
      body.category_ratings,
      scale,
      settings.ratingCategories,
    );

    const page = await findOrCreatePage(ctx.project.id, body.page_url, body.page_title);
    const commenterId = await resolveAnonymousCommenterId(ctx, body, settings);

    const status = settings.requireApproval ? "pending" : "approved";

    const review = await createOrReviveReview(
      {
        projectId: ctx.project.id,
        pageId: page.id,
        commenterId,
        rating: body.rating,
        categoryRatings,
        title: title || null,
        content,
        htmlContent,
        attachments: attachmentList.length > 0 ? (attachmentList as Prisma.InputJsonValue) : undefined,
        status,
      },
      settings.allowMultipleReviews,
    );

    if (review.status === "approved") {
      await recalculatePageRatingSummary(page.id, scale);
    }

    const commenterToken = createCommenterToken(commenterId, ctx.project.id);

    return jsonSuccess({
      review: singlePublicReview(review),
      commenter_token: commenterToken,
    });
  });
}
