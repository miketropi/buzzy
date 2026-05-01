import type { NextRequest } from "next/server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/internal/project-access";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { assertRequestActsAsCommenter } from "@/lib/public-api/resolve-session-commenter";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { runPublicApi } from "@/lib/public-api/handler";
import {
  parseCategoryRatingsForPatch,
} from "@/lib/public-api/review-categories";
import { recalculatePageRatingSummary } from "@/lib/public-api/rating-summary";
import { sanitizeCommentContent, sanitizeCommentHtml } from "@/lib/public-api/sanitize-content";
import {
  matchesSpamPatterns,
} from "@/lib/public-api/spam";
import { singlePublicReview } from "@/lib/public-api/serialize-review";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";
import { patchReviewBodySchema } from "@/lib/validators/review";

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

type RouteCtx =
  | { params: Promise<{ reviewId: string }> }
  | { params: { reviewId: string } };

async function getParams(context: RouteCtx) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function PATCH(request: NextRequest, context: RouteCtx) {
  return runPublicApi(request, async (ctx) => {
    const { reviewId } = await getParams(context);
    if (!isUuid(reviewId)) {
      throw new NotFoundError("Review not found");
    }

    if (normalizeWidgetMode(ctx.project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    if (!settings.enableRating) {
      throw new ForbiddenError("Ratings are disabled for this project");
    }

    const patch = patchReviewBodySchema.parse(await request.json());

    const review = await prisma.review.findFirst({
      where: { id: reviewId, projectId: ctx.project.id },
    });
    if (!review) {
      throw new NotFoundError("Review not found");
    }
    if (review.status === "deleted") {
      throw new ForbiddenError("Review was deleted");
    }

    await assertRequestActsAsCommenter(ctx.request, ctx.project, settings, review.commenterId);

    if (Date.now() - review.createdAt.getTime() > EDIT_WINDOW_MS) {
      throw new ForbiddenError("Edit window has expired");
    }

    const scale = settings.ratingScale;
    if (patch.rating !== undefined && (patch.rating < 1 || patch.rating > scale)) {
      throw new ValidationError(`Rating must be between 1 and ${scale}`);
    }

    const catParsed =
      patch.category_ratings !== undefined
        ? parseCategoryRatingsForPatch(patch.category_ratings, scale, settings.ratingCategories)
        : undefined;

    const spamProbe = `${patch.title ?? ""}\n${patch.content ?? ""}\n${patch.html ?? ""}`;
    if (spamProbe.trim() && matchesSpamPatterns(spamProbe, settings)) {
      throw new ValidationError("This message was blocked by the spam filter");
    }

    const title =
      patch.title !== undefined
        ? patch.title
          ? sanitizeCommentContent(patch.title).slice(0, 200)
          : null
        : undefined;

    const data: Prisma.ReviewUpdateInput = {};
    if (patch.rating !== undefined) {
      data.rating = patch.rating;
    }
    if (title !== undefined) {
      data.title = title;
    }

    if (patch.content !== undefined || patch.html !== undefined) {
      let nextHtml: string | null;
      if (patch.html !== undefined) {
        nextHtml = patch.html.trim() ? sanitizeCommentHtml(patch.html) : null;
        if (nextHtml === "") nextHtml = null;
      } else {
        nextHtml = null;
      }

      let nextContent: string | null;
      if (patch.html !== undefined) {
        const plainFromText =
          patch.content !== undefined ? sanitizeCommentContent(patch.content ?? "") : "";
        const plainFromHtml = sanitizeCommentContent(patch.html ?? "");
        nextContent = (plainFromText || plainFromHtml).trim() || null;
        if (!nextContent && nextHtml) {
          const stripped = sanitizeCommentContent(nextHtml);
          nextContent = stripped.length > 0 ? stripped : null;
        }
        if (!nextContent && nextHtml && /<img[\s>]/i.test(nextHtml)) {
          nextContent = "(image)";
        }
        if (!nextContent && nextHtml && /<video[\s>]/i.test(nextHtml)) {
          nextContent = "(video)";
        }
      } else {
        nextContent = patch.content ? sanitizeCommentContent(patch.content) : null;
      }

      if (settings.requireRatingText && !nextContent) {
        throw new ValidationError("Review text is required");
      }

      data.content = nextContent;
      data.htmlContent = nextHtml;
    }
    if (catParsed !== undefined) {
      data.categoryRatings = catParsed === Prisma.JsonNull ? Prisma.JsonNull : catParsed;
    }
    data.editedAt = new Date();

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: { commenter: { select: { name: true, avatar: true } } },
    });

    if (updated.status === "approved") {
      await recalculatePageRatingSummary(updated.pageId, scale);
    }

    return jsonSuccess({ review: singlePublicReview(updated) });
  });
}

export async function DELETE(request: NextRequest, context: RouteCtx) {
  return runPublicApi(request, async (ctx) => {
    const { reviewId } = await getParams(context);
    if (!isUuid(reviewId)) {
      throw new NotFoundError("Review not found");
    }

    if (normalizeWidgetMode(ctx.project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    const review = await prisma.review.findFirst({
      where: { id: reviewId, projectId: ctx.project.id },
    });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    await assertRequestActsAsCommenter(ctx.request, ctx.project, settings, review.commenterId);

    const wasApproved = review.status === "approved";

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        content: "[deleted]",
        title: null,
        status: "deleted",
        editedAt: new Date(),
        htmlContent: null,
        categoryRatings: Prisma.JsonNull,
      },
    });

    if (wasApproved) {
      await recalculatePageRatingSummary(review.pageId, settings.ratingScale);
    }

    return jsonSuccess({ deleted: true });
  });
}
