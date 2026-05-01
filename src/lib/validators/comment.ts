import { z } from "zod";

import { attachmentsPayloadSchema } from "@/lib/validators/attachment";
import { commenterAnonymousSchema } from "@/lib/validators/commenter";
import { pageIdentifierSchema } from "@/lib/validators/page-identifier";

export const commentSortSchema = z.enum(["newest", "oldest", "popular"]).default("newest");

export const listCommentsQuerySchema = z.object({
  key: z.string().min(1),
  page_url: pageIdentifierSchema,
  sort: commentSortSchema,
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const createCommentBodySchema = z
  .object({
    page_url: pageIdentifierSchema,
    page_title: z.string().max(300).optional(),
    content: z.string().max(20_000).optional(),
    /** Sanitized server-side; paired with plain `content` for search / spam. */
    html: z.string().max(120_000).optional(),
    parent_id: z.string().optional(),
    /** Images, videos, and documents stored separately from html (R2 URLs only). */
    attachments: attachmentsPayloadSchema.optional(),
    commenter: commenterAnonymousSchema,
  })
  .superRefine((data, ctx) => {
    const c = (data.content ?? "").trim();
    const h = (data.html ?? "").trim();
    const att = data.attachments ?? [];
    if (!c && !h && att.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "content, html, or attachments is required",
        path: ["content"],
      });
    }
  });

export const patchCommentBodySchema = z
  .object({
    content: z.string().max(20_000).optional(),
    html: z.string().max(120_000).optional(),
  })
  .refine((d) => d.content !== undefined || d.html !== undefined, {
    message: "content or html is required",
    path: ["content"],
  });

export const voteBodySchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export const reportCommentBodySchema = z.object({
  reason: z.enum(["spam", "harassment", "offensive", "other"]),
  description: z.string().max(2000).optional(),
});

export const publicConfigQuerySchema = z.object({
  key: z.string().min(1),
});
