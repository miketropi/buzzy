"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { EmbedAttachment } from "./attachment-types";
import { BzAttachmentLightbox } from "./bz-attachment-lightbox";
import { BzPlayCircleIcon } from "./bz-icons";

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
  const [viewer, setViewer] = useState<EmbedAttachment | null>(null);

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
          <button
            key={a.url}
            type="button"
            className="bz-attachments-thumb-trigger"
            onClick={() => setViewer(a)}
            aria-label={`View image: ${labelFile(a)}`}
          >
            <img src={a.url} alt="" className="bz-attachments-thumb" loading="lazy" />
          </button>
        ))}
      </div>
    ) : null;

  const vidBlock =
    g.videos.length > 0 ? (
      <div className="bz-attachments-videos">
        {g.videos.map((a) => (
          <button
            key={a.url}
            type="button"
            className="bz-attachments-video-trigger"
            onClick={() => setViewer(a)}
            aria-label={`Play video: ${labelFile(a)}`}
          >
            <video
              className="bz-attachments-video-poster"
              src={a.url}
              muted
              playsInline
              preload="metadata"
              aria-hidden
            />
            <span className="bz-attachments-video-play" aria-hidden>
              <BzPlayCircleIcon className="bz-attachments-video-play-ico" />
            </span>
          </button>
        ))}
      </div>
    ) : null;

  const docList =
    g.documents.length > 0 ? (
      <ul className="bz-attachments-docs">
        {g.documents.map((a) => (
          <li key={a.url}>
            <button
              type="button"
              className="bz-attachments-doc-trigger"
              onClick={() => setViewer(a)}
              aria-label={`View file: ${labelFile(a)}`}
            >
              {labelFile(a)}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="bz-attachments-display">
      {sec("Images", imgGrid)}
      {sec("Videos", vidBlock)}
      {sec("Documents", docList)}
      <BzAttachmentLightbox attachment={viewer} onClose={() => setViewer(null)} />
    </div>
  );
}
