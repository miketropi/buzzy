import type { ReviewWithPublicCommenter } from "@/lib/public-api/review-types";

import { attachmentsFromDb } from "@/lib/public-api/attachments";

export function singlePublicReview(row: ReviewWithPublicCommenter) {
  let category_ratings: Record<string, number> | null = null;
  if (
    row.categoryRatings &&
    typeof row.categoryRatings === "object" &&
    !Array.isArray(row.categoryRatings)
  ) {
    category_ratings = {};
    for (const [k, v] of Object.entries(row.categoryRatings as Record<string, unknown>)) {
      if (typeof v === "number") {
        category_ratings[k] = v;
      }
    }
  }
  return {
    id: row.id,
    rating: row.rating,
    category_ratings,
    title: row.title,
    content: row.content,
    html_content: row.htmlContent ?? null,
    attachments: attachmentsFromDb(row.attachments),
    status: row.status,
    helpful_count: row.helpfulCount,
    unhelpful_count: row.unhelpfulCount,
    is_verified: row.isVerified,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    commenter: { name: row.commenter.name, avatar: row.commenter.avatar },
    staff_reply_content: row.staffReplyContent ?? null,
    staff_reply_html: row.staffReplyHtml ?? null,
    staff_replied_at: row.staffRepliedAt ? row.staffRepliedAt.toISOString() : null,
  };
}
