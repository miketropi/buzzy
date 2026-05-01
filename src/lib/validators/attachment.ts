import { z } from "zod";

export const attachmentItemSchema = z.object({
  kind: z.enum(["image", "video", "document"]),
  url: z.string().url().max(2048),
  filename: z.string().max(240).optional(),
  content_type: z.string().max(120).optional(),
});

/** Max attachments per comment or review (widget + API). */
export const MAX_ATTACHMENTS = 12;

export const attachmentsPayloadSchema = z.array(attachmentItemSchema).max(MAX_ATTACHMENTS);

export type AttachmentPayloadItem = z.infer<typeof attachmentItemSchema>;
