import { z } from "zod";

import { attachmentsPayloadSchema } from "@/lib/validators/attachment";
import { commenterAnonymousSchema } from "@/lib/validators/commenter";
import { pageIdentifierSchema } from "@/lib/validators/page-identifier";

export const reviewSortSchema = z
  .enum(["newest", "oldest", "highest", "lowest", "helpful"])
  .default("newest");

export const listReviewsQuerySchema = z.object({
  key: z.string().min(1),
  page_url: pageIdentifierSchema,
  sort: reviewSortSchema,
  rating: z.coerce.number().int().min(1).max(10).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export { commenterAnonymousSchema };

export const createReviewBodySchema = z.object({
  page_url: pageIdentifierSchema,
  page_title: z.string().max(300).optional(),
  rating: z.number().int().min(1).max(10),
  category_ratings: z.record(z.string(), z.number().int().min(1).max(10)).optional(),
  title: z.string().max(200).optional(),
  content: z.string().max(20_000).optional(),
  /** Sanitized server-side; plain `content` is derived for search / spam. */
  html: z.string().max(120_000).optional(),
  attachments: attachmentsPayloadSchema.optional(),
  commenter: commenterAnonymousSchema,
});

export const patchReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  title: z.string().max(200).optional(),
  content: z.string().max(20_000).optional(),
  html: z.string().max(120_000).optional(),
  category_ratings: z.record(z.string(), z.number().int().min(1).max(10)).optional(),
});

export const reportReviewBodySchema = z.object({
  reason: z.enum(["spam", "fake_review", "harassment", "offensive", "other"]),
  description: z.string().max(2000).optional(),
});

export const ratingSummaryQuerySchema = z.object({
  key: z.string().min(1),
  page_url: pageIdentifierSchema,
});
