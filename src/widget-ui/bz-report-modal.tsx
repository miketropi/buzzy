"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "../embed/embed-fetch";
import { BzComposerModal } from "./bz-composer-modal";

export type ReportReasonOption = { value: string; label: string };

const COMMENT_REASONS: ReportReasonOption[] = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "offensive", label: "Offensive" },
  { value: "other", label: "Other" },
];

const REVIEW_REASONS: ReportReasonOption[] = [
  { value: "spam", label: "Spam" },
  { value: "fake_review", label: "Fake review" },
  { value: "harassment", label: "Harassment" },
  { value: "offensive", label: "Offensive" },
  { value: "other", label: "Other" },
];

export function defaultReportReasons(variant: "comment" | "review"): ReportReasonOption[] {
  return variant === "comment" ? COMMENT_REASONS : REVIEW_REASONS;
}

export function BzReportModal({
  open,
  onClose,
  apiBase,
  apiKey,
  variant,
  targetId,
}: {
  open: boolean;
  onClose: () => void;
  apiBase: string;
  apiKey: string;
  variant: "comment" | "review";
  targetId: string | null;
}) {
  const reasonOptions = defaultReportReasons(variant);
  const [reason, setReason] = useState(reasonOptions[0]?.value ?? "other");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason(reasonOptions[0]?.value ?? "other");
    setDescription("");
    setErr("");
  }, [open, reasonOptions]);

  async function submit() {
    if (!targetId) return;
    setBusy(true);
    setErr("");
    try {
      const path =
        variant === "comment"
          ? `/api/v1/comments/${encodeURIComponent(targetId)}/report?key=${encodeURIComponent(apiKey)}`
          : `/api/v1/reviews/${encodeURIComponent(targetId)}/report?key=${encodeURIComponent(apiKey)}`;
      await fetchJson(apiBase + path, {
        method: "POST",
        body: {
          reason,
          ...(description.trim() ? { description: description.trim().slice(0, 2000) } : {}),
        },
      });
      setDescription("");
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const dlgTitle = variant === "comment" ? "Report comment" : "Report review";

  return (
    <BzComposerModal
      open={open && Boolean(targetId)}
      onClose={onClose}
      title={dlgTitle}
      stepIndex={0}
      totalSteps={1}
      stepLabels={["Report"]}
      shortcutHints={false}
      footer={
        <div className="bz-modal-footer-inner">
          <button type="button" className="bz-btn--secondary bz-btn--modal" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bz-btn bz-btn--modal bz-btn--modal-primary"
            disabled={busy || !targetId}
            onClick={() => void submit()}
          >
            {busy ? "Sending…" : "Submit report"}
          </button>
        </div>
      }
    >
      <p className="bz-modal-intro-text" style={{ marginBottom: "var(--bz-space-4)" }}>
        Reports are reviewed by the site team. Misuse may be rate limited.
      </p>
      <div className="bz-form-field">
        <label htmlFor="bz-report-reason" className="bz-l">
          Reason
        </label>
        <select
          id="bz-report-reason"
          className="bz-in"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {reasonOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="bz-form-field">
        <label htmlFor="bz-report-desc" className="bz-l">
          Details (optional)
        </label>
        <textarea
          id="bz-report-desc"
          className="bz-in"
          rows={3}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add context that helps moderators."
        />
      </div>
      {err ? <p className="bz-msg">{err}</p> : null}
    </BzComposerModal>
  );
}
