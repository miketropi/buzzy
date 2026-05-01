import { fetchJson } from "../embed/embed-fetch";
import type { EmbedAttachment } from "./attachment-types";

/** Must match presign route + `guessExt` in r2-upload. */
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export const WIDGET_UPLOAD_ACCEPT = Array.from(ALLOWED_MIMES).join(",");

export function isAllowedUploadMime(mime: string): boolean {
  return ALLOWED_MIMES.has(mime);
}

type PresignContentType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "video/mp4"
  | "video/webm"
  | "video/quicktime"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/msword";

const EXT_TO_MIME: Record<string, PresignContentType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

/**
 * Many browsers leave `file.type` empty for picked files; infer from extension when needed.
 */
export function resolveUploadMime(file: File): string | null {
  const raw = file.type?.trim() ?? "";
  if (raw && raw !== "application/octet-stream" && isAllowedUploadMime(raw)) {
    return raw;
  }
  const ext = file.name.includes(".") ? (file.name.split(".").pop() ?? "").toLowerCase() : "";
  const inferred = ext ? EXT_TO_MIME[ext] : undefined;
  return inferred && isAllowedUploadMime(inferred) ? inferred : null;
}

export function inferAttachmentKind(mime: string): EmbedAttachment["kind"] {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

export async function uploadWidgetFile(apiBase: string, apiKey: string, file: File, contentType?: string): Promise<string> {
  const ct = (contentType?.trim() || file.type?.trim() || "") as PresignContentType;
  if (!isAllowedUploadMime(ct)) {
    throw new Error("Unsupported file type");
  }
  const json = await fetchJson(apiBase + "/api/v1/uploads/r2?key=" + encodeURIComponent(apiKey), {
    method: "POST",
    body: {
      content_type: ct,
      filename: file.name,
    },
  });
  const d = json.data as { upload_url: string; public_url: string };
  const put = await fetch(d.upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": ct },
  });
  if (!put.ok) {
    throw new Error("Upload failed");
  }
  return d.public_url;
}
