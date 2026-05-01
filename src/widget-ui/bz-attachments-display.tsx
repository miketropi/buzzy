import type { ReactNode } from "react";
import type { EmbedAttachment } from "./attachment-types";

function group(items: EmbedAttachment[]) {
  return {
    images: items.filter((i) => i.kind === "image"),
    videos: items.filter((i) => i.kind === "video"),
    documents: items.filter((i) => i.kind === "document"),
  };
}

function labelFile(a: EmbedAttachment) {
  return a.filename?.trim() || (a.kind === "document" ? "Document" : "File");
}

/** Read-only: images, videos, and documents in separate sections (live + preview). */
export function BzAttachmentsDisplay({
  items,
  compact,
}: {
  items: EmbedAttachment[];
  compact?: boolean;
}) {
  if (!items.length) return null;
  const g = group(items);
  const sec = (title: string, inner: ReactNode) =>
    inner ? (
      <div key={title} className="bz-attachments-section">
        <p className="bz-attachments-section-title">{title}</p>
        {inner}
      </div>
    ) : null;

  const imgGrid =
    g.images.length > 0 ? (
      <div className={`bz-attachments-grid${compact ? " bz-attachments-grid--compact" : ""}`}>
        {g.images.map((a) => (
          <a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bz-attachments-thumb-wrap"
          >
            <img src={a.url} alt="" className="bz-attachments-thumb" loading="lazy" />
          </a>
        ))}
      </div>
    ) : null;

  const vidBlock =
    g.videos.length > 0 ? (
      <div className="bz-attachments-videos">
        {g.videos.map((a) => (
          <video
            key={a.url}
            className="bz-attachments-video"
            src={a.url}
            controls
            playsInline
            preload="metadata"
          />
        ))}
      </div>
    ) : null;

  const docList =
    g.documents.length > 0 ? (
      <ul className="bz-attachments-docs">
        {g.documents.map((a) => (
          <li key={a.url}>
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="bz-link">
              {labelFile(a)}
            </a>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="bz-attachments-display">
      {sec("Images", imgGrid)}
      {sec("Videos", vidBlock)}
      {sec("Documents", docList)}
    </div>
  );
}
