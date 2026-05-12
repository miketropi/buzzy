"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { EmbedAttachment } from "./attachment-types";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function labelFile(a: EmbedAttachment) {
  return a.filename?.trim() || (a.kind === "document" ? "Document" : "File");
}

function isPdfAttachment(a: EmbedAttachment): boolean {
  const ct = (a.content_type ?? "").toLowerCase();
  if (ct.includes("pdf")) return true;
  const path = a.url.split("?")[0]?.toLowerCase() ?? "";
  return path.endsWith(".pdf");
}

export function BzAttachmentLightbox({
  attachment,
  onClose,
}: {
  attachment: EmbedAttachment | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const [shown, setShown] = useState(false);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setShown(false);
    const ms = prefersReducedMotion() ? 0 : 260;
    window.setTimeout(() => {
      closingRef.current = false;
      onClose();
    }, ms);
  }, [onClose]);

  useEffect(() => {
    if (!attachment) {
      closingRef.current = false;
      setShown(false);
      return;
    }
    setShown(false);
    if (prefersReducedMotion()) {
      setShown(true);
      return;
    }
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true));
    });
    return () => cancelAnimationFrame(outer);
  }, [attachment]);

  useEffect(() => {
    if (!attachment) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [attachment, handleClose]);

  useEffect(() => {
    if (!attachment) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [attachment]);

  useEffect(() => {
    if (!attachment || !shown) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), prefersReducedMotion() ? 0 : 50);
    return () => window.clearTimeout(t);
  }, [attachment, shown]);

  if (!attachment) return null;

  const rootClass =
    `bz-media-lightbox-root${shown ? " bz-media-lightbox-root--shown" : ""}`.trim();
  const title = labelFile(attachment);

  let stage: ReactNode;
  if (attachment.kind === "image") {
    stage = (
      // Widget shows arbitrary host/upload URLs; next/image remotePatterns are not practical here.
      // eslint-disable-next-line @next/next/no-img-element -- dynamic attachment URLs
      <img
        className="bz-media-lightbox-img"
        src={attachment.url}
        alt={title}
        decoding="async"
      />
    );
  } else if (attachment.kind === "video") {
    stage = (
      <video
        className="bz-media-lightbox-video"
        src={attachment.url}
        controls
        playsInline
        preload="metadata"
      />
    );
  } else if (isPdfAttachment(attachment)) {
    stage = (
      <iframe
        className="bz-media-lightbox-iframe"
        src={attachment.url}
        title={title}
        sandbox="allow-same-origin allow-downloads allow-popups"
      />
    );
  } else {
    stage = (
      <div className="bz-media-lightbox-file-fallback">
        <p className="bz-media-lightbox-file-hint">No inline preview for this file type.</p>
      </div>
    );
  }

  return (
    <div
      className={rootClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="bz-media-lightbox-backdrop"
        aria-label="Close"
        onClick={handleClose}
      />
      <div className="bz-media-lightbox-panel">
        <button
          ref={closeBtnRef}
          type="button"
          className="bz-media-lightbox-close"
          aria-label="Close"
          onClick={handleClose}
        >
          <span className="bz-media-lightbox-close-glyph" aria-hidden>
            ✕
          </span>
        </button>

        <div className="bz-media-lightbox-stage">
          {attachment.kind === "document" && isPdfAttachment(attachment) ? (
            <div className="bz-media-lightbox-frame">{stage}</div>
          ) : (
            stage
          )}
        </div>

        <footer className="bz-media-lightbox-footer">
          <p id={titleId} className="bz-media-lightbox-caption">
            {title}
          </p>
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bz-media-lightbox-open-link"
          >
            Open in new tab
          </a>
        </footer>
      </div>
    </div>
  );
}
