/** Mirrors API `attachments` JSON (kept in widget bundle only — no server imports). */
export type EmbedAttachment = {
  kind: "image" | "video" | "document";
  url: string;
  filename?: string;
  content_type?: string;
};

export const MAX_EMBED_ATTACHMENTS = 12;
