import { z } from "zod";

export const messageStatusFilterSchema = z.enum(["pending", "approved", "spam", "deleted", "all"]).optional();

export const listInternalMessagesQuerySchema = z.object({
  status: messageStatusFilterSchema,
  /** Search comment/review body, page URL/title, author name/email (case depends on DB collation). */
  q: z.string().max(160).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).max(10_000).optional(),
});

export const bulkMessageStatusBodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(["pending", "approved", "spam", "deleted"]),
});

export const patchMessageStatusBodySchema = z.object({
  status: z.enum(["pending", "approved", "spam", "deleted"]),
});

export const staffReplyCommentBodySchema = z
  .object({
    parent_id: z.string().uuid(),
    content: z.string().max(20_000).optional(),
    html: z.string().max(120_000).optional(),
  })
  .superRefine((data, ctx) => {
    const c = (data.content ?? "").trim();
    const h = (data.html ?? "").trim();
    if (!c && !h) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "content or html is required",
        path: ["content"],
      });
    }
  });

export const patchReviewAdminBodySchema = z
  .object({
    status: z.enum(["pending", "approved", "spam", "deleted"]).optional(),
    clearStaffReply: z.boolean().optional(),
    staffReplyContent: z.string().max(20_000).optional(),
    staffReplyHtml: z.string().max(120_000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.clearStaffReply) {
      return;
    }
    const hasStatus = data.status !== undefined;
    const replyC = data.staffReplyContent !== undefined;
    const replyH = data.staffReplyHtml !== undefined;
    const c = (data.staffReplyContent ?? "").trim();
    const h = (data.staffReplyHtml ?? "").trim();
    if (replyC || replyH) {
      if (!c && !h) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "staff reply text or HTML must be non-empty",
          path: ["staffReplyContent"],
        });
      }
    }
    if (!hasStatus && !replyC && !replyH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide status, staff reply fields, or clearStaffReply",
        path: ["status"],
      });
    }
  });
