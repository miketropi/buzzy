"use client";

import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_EMBED_ATTACHMENTS, type EmbedAttachment } from "./attachment-types";
import {
  inferAttachmentKind,
  resolveUploadMime,
  uploadWidgetFile,
  WIDGET_UPLOAD_ACCEPT,
} from "./widget-upload";

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

type PendingSlot = {
  id: string;
  file: File;
  previewUrl: string;
  mime: string;
  /** `null` while uploading */
  error: string | null;
};

export function BzAttachmentsPanel({
  items,
  onChange,
  uploadsEnabled,
  disabled,
  apiBase,
  apiKey,
}: {
  items: EmbedAttachment[];
  onChange: (next: EmbedAttachment[]) => void;
  uploadsEnabled: boolean;
  disabled?: boolean;
  apiBase: string;
  apiKey: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<PendingSlot[]>([]);
  const [pending, setPending] = useState<PendingSlot[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  pendingRef.current = pending;

  useEffect(() => {
    return () => {
      for (const p of pendingRef.current) {
        URL.revokeObjectURL(p.previewUrl);
      }
    };
  }, []);

  const removePending = useCallback((id: string) => {
    setPending((prev) => {
      const slot = prev.find((x) => x.id === id);
      if (slot) URL.revokeObjectURL(slot.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setErr("");
      const raw = Array.from(fileList);
      const resolved = raw
        .map((file) => {
          const mime = resolveUploadMime(file);
          return mime ? { file, mime } : null;
        })
        .filter((x): x is { file: File; mime: string } => x !== null);

      if (!resolved.length) {
        setErr(
          "No supported files. Use JPEG, PNG, WebP, GIF, PDF, Word (.doc/.docx), or MP4 / WebM / MOV — or check that the file has an extension.",
        );
        return;
      }

      const room = Math.max(0, MAX_EMBED_ATTACHMENTS - items.length - pendingRef.current.length);
      const capped = resolved.slice(0, room);
      if (resolved.length > capped.length) {
        setErr(
          `You can add up to ${MAX_EMBED_ATTACHMENTS} attachments (${room} slot(s) left). Extra files were skipped.`,
        );
      }

      if (!capped.length) {
        setErr(`Maximum of ${MAX_EMBED_ATTACHMENTS} attachments reached. Remove one to add more.`);
        return;
      }

      const newPending: PendingSlot[] = capped.map((row) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        file: row.file,
        previewUrl: URL.createObjectURL(row.file),
        mime: row.mime,
        error: null,
      }));

      setPending((prev) => [...prev, ...newPending]);
      setBusy(true);

      let nextItems = [...items];
      try {
        for (const slot of newPending) {
          if (nextItems.length >= MAX_EMBED_ATTACHMENTS) break;
          try {
            const url = await uploadWidgetFile(apiBase, apiKey, slot.file, slot.mime);
            URL.revokeObjectURL(slot.previewUrl);
            setPending((prev) => prev.filter((x) => x.id !== slot.id));
            const att: EmbedAttachment = {
              kind: inferAttachmentKind(slot.mime),
              url,
              filename: slot.file.name,
              content_type: slot.mime,
            };
            nextItems = [...nextItems, att];
            onChange(nextItems);
          } catch (e: unknown) {
            const msg =
              e instanceof Error ? e.message : "Upload failed. Try a smaller file or check R2 / CORS.";
            setPending((prev) => prev.map((x) => (x.id === slot.id ? { ...x, error: msg } : x)));
          }
        }
      } finally {
        setBusy(false);
      }
    },
    [apiBase, apiKey, items, onChange],
  );

  const remove = (url: string, e?: MouseEvent) => {
    e?.stopPropagation();
    onChange(items.filter((i) => i.url !== url));
  };

  const g = group(items);
  const off = !uploadsEnabled || disabled;
  const showQueue = items.length > 0 || pending.length > 0;

  const pendingImages = pending.filter((p) => inferAttachmentKind(p.mime) === "image");
  const pendingVideos = pending.filter((p) => inferAttachmentKind(p.mime) === "video");
  const pendingDocs = pending.filter((p) => inferAttachmentKind(p.mime) === "document");

  return (
    <div className="bz-attachments-panel">
      <div
        className={`bz-attachments-drop${off ? " bz-attachments-drop--off" : ""}`}
        onDragOver={(e) => {
          if (!off) e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (off || busy) return;
          void addFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="bz-sr-only"
          accept={WIDGET_UPLOAD_ACCEPT}
          multiple
          tabIndex={-1}
          aria-hidden
          disabled={off || busy}
          onChange={(e) => {
            const fl = e.target.files;
            const input = e.target;
            if (fl?.length) void addFiles(fl);
            input.value = "";
          }}
        />
        <p className="bz-attachments-drop-label">
          {uploadsEnabled
            ? "Drag files here or use Choose files — they are added below (not inside the text)."
            : "File uploads are not configured for this project."}
        </p>
        {uploadsEnabled ? (
          <button
            type="button"
            className="bz-attachments-choose-btn"
            disabled={!!disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Uploading…" : "Choose files"}
          </button>
        ) : null}
      </div>
      {err ? <p className="bz-attachments-err">{err}</p> : null}
      {showQueue ? (
        <div className="bz-attachments-queue">
          {pendingImages.length > 0 || g.images.length > 0 ? (
            <div className="bz-attachments-section">
              <p className="bz-attachments-section-title">Images</p>
              <div className="bz-attachments-grid bz-attachments-grid--compact">
                {pendingImages.map((p) => (
                  <div key={p.id} className="bz-attachments-queue-item">
                    <div className="bz-attachments-thumb-wrap">
                      <img src={p.previewUrl} alt="" className="bz-attachments-thumb" />
                      {p.error === null ? (
                        <div className="bz-attachments-pending-overlay" aria-hidden>
                          <span className="bz-attachments-spin" />
                        </div>
                      ) : (
                        <div className="bz-attachments-pending-overlay bz-attachments-pending-overlay--err">
                          <span className="bz-attachments-pending-err">{p.error}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="bz-attachments-remove"
                      aria-label={p.error ? "Dismiss" : "Cancel upload"}
                      disabled={disabled || (p.error === null && busy)}
                      onClick={() => removePending(p.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {g.images.map((a) => (
                  <div key={a.url} className="bz-attachments-queue-item">
                    <div className="bz-attachments-thumb-wrap">
                      <img src={a.url} alt="" className="bz-attachments-thumb" loading="lazy" />
                    </div>
                    <button
                      type="button"
                      className="bz-attachments-remove"
                      aria-label="Remove"
                      disabled={disabled}
                      onClick={(e) => remove(a.url, e)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {pendingVideos.length > 0 || g.videos.length > 0 ? (
            <div className="bz-attachments-section">
              <p className="bz-attachments-section-title">Videos</p>
              <div className="bz-attachments-videos">
                {pendingVideos.map((p) => (
                  <div key={p.id} className="bz-attachments-queue-item bz-attachments-queue-item--video">
                    <video
                      className="bz-attachments-video"
                      src={p.previewUrl}
                      muted
                      playsInline
                      preload="metadata"
                    />
                    {p.error === null ? (
                      <div className="bz-attachments-pending-overlay bz-attachments-pending-overlay--video" aria-hidden>
                        <span className="bz-attachments-spin" />
                      </div>
                    ) : (
                      <div className="bz-attachments-pending-overlay bz-attachments-pending-overlay--err bz-attachments-pending-overlay--video">
                        <span className="bz-attachments-pending-err">{p.error}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="bz-attachments-remove"
                      aria-label={p.error ? "Dismiss" : "Cancel upload"}
                      disabled={disabled || (p.error === null && busy)}
                      onClick={() => removePending(p.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {g.videos.map((a) => (
                  <div key={a.url} className="bz-attachments-queue-item bz-attachments-queue-item--video">
                    <video className="bz-attachments-video" src={a.url} controls playsInline preload="metadata" />
                    <button
                      type="button"
                      className="bz-attachments-remove"
                      aria-label="Remove"
                      disabled={disabled}
                      onClick={(e) => remove(a.url, e)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {pendingDocs.length > 0 || g.documents.length > 0 ? (
            <div className="bz-attachments-section">
              <p className="bz-attachments-section-title">Documents</p>
              <ul className="bz-attachments-docs">
                {pendingDocs.map((p) => (
                  <li key={p.id} className="bz-attachments-doc-row bz-attachments-doc-row--pending">
                    <span className="bz-attachments-doc-name">{p.file.name}</span>
                    {p.error === null ? (
                      <span className="bz-attachments-doc-status" aria-live="polite">
                        <span className="bz-attachments-spin bz-attachments-spin--inline" /> Uploading…
                      </span>
                    ) : (
                      <span className="bz-attachments-doc-status bz-attachments-doc-status--err">{p.error}</span>
                    )}
                    <button
                      type="button"
                      className="bz-attachments-remove"
                      aria-label={p.error ? "Dismiss" : "Cancel upload"}
                      disabled={disabled || (p.error === null && busy)}
                      onClick={() => removePending(p.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
                {g.documents.map((a) => (
                  <li key={a.url} className="bz-attachments-doc-row">
                    <span className="bz-attachments-doc-name">{labelFile(a)}</span>
                    <button
                      type="button"
                      className="bz-attachments-remove"
                      aria-label="Remove"
                      disabled={disabled}
                      onClick={(e) => remove(a.url, e)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
