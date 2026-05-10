import { z } from "zod";

export const appealCreateBodySchema = z
  .object({
    comment_id: z.string().uuid().optional(),
    review_id: z.string().uuid().optional(),
    message: z.string().min(1).max(4000),
    email: z.union([z.string().email(), z.literal("")]).optional(),
  })
  .superRefine((d, ctx) => {
    const c = d.comment_id !== undefined && d.comment_id !== "";
    const r = d.review_id !== undefined && d.review_id !== "";
    if (c === r) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one of comment_id or review_id is required.",
        path: ["comment_id"],
      });
    }
  });

export const patchAppealBodySchema = z.object({
  status: z.enum(["open", "reviewed", "dismissed", "actioned"]),
});
