"use client";

import type { LegacyRef, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { BzIconClose } from "./bz-modal-nav-icons";

export function BzModalShortcutHints({
  id,
  placement = "inside",
}: {
  id: string;
  /** `inside` = foot of modal sheet; `below` = legacy separate chip under sheet. */
  placement?: "inside" | "below";
}) {
  return (
    <div
      id={id}
      className={`bz-modal-hint-strip${placement === "below" ? " bz-modal-hint-strip--below" : " bz-modal-hint-strip--inside"}`}
      role="note"
    >
      <span className="bz-modal-hint-item">
        <kbd className="bz-kbd">Esc</kbd>
        <span className="bz-modal-hint-item-text"> · outside</span>
      </span>
      <span className="bz-modal-hint-sep" aria-hidden>
        ·
      </span>
      <span className="bz-modal-hint-item">closes</span>
      <span className="bz-modal-hint-sep bz-modal-hint-sep--hide-sm" aria-hidden>
        ·
      </span>
      <span className="bz-modal-hint-item bz-modal-hint-item--wrap">
        <span className="bz-modal-hint-short">Step 2: files (optional)</span>
        <span className="bz-modal-hint-long">Step two is only if you want attachments</span>
      </span>
    </div>
  );
}

export function BzComposerModalFrame({
  titleId,
  title,
  stepIndex,
  totalSteps,
  stepLabels,
  children,
  footer,
  sheetRef,
  onClose,
  inline = false,
  describedBy,
}: {
  titleId: string;
  title: string;
  stepIndex: number;
  totalSteps: number;
  stepLabels: string[];
  children: ReactNode;
  footer: ReactNode;
  sheetRef?: LegacyRef<HTMLDivElement>;
  /** When omitted (e.g. appearance preview), the close control is visual-only. */
  onClose?: () => void;
  /** Embedded in the dashboard preview: no fixed overlay, open layout. */
  inline?: boolean;
  /** Optional id for shortcut hints (rendered inside sheet when set). */
  describedBy?: string;
}) {
  const safeStep = Math.min(Math.max(0, stepIndex), Math.max(0, totalSteps - 1));
  const stepNum = safeStep + 1;
  const showProgress = totalSteps > 1;
  const stepLabel = stepLabels[safeStep]?.trim() ?? "";
  const bodyRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef<number | null>(null);

  useEffect(() => {
    if (inline) return;
    const el = bodyRef.current;
    if (!el) return;
    if (prevStepRef.current === null) {
      prevStepRef.current = safeStep;
      return;
    }
    if (prevStepRef.current === safeStep) return;
    prevStepRef.current = safeStep;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    el.classList.remove("bz-modal-body--step-in");
    void el.offsetWidth;
    el.classList.add("bz-modal-body--step-in");
    const onEnd = () => el.classList.remove("bz-modal-body--step-in");
    el.addEventListener("animationend", onEnd, { once: true });
  }, [safeStep, inline]);

  return (
    <div
      ref={sheetRef}
      className={`bz-modal-sheet${inline ? " bz-modal-sheet--inline" : ""}`}
      role={inline ? "region" : "dialog"}
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
    >
      {inline ? null : (
        <div className="bz-modal-grab" aria-hidden="true">
          <span className="bz-modal-grab-bar" />
        </div>
      )}

      <div className="bz-modal-header">
        <div className="bz-modal-header-main">
          <h2 id={titleId} className="bz-modal-title">
            <span className="bz-modal-title-primary">{title}</span>
            {showProgress ? (
              <span className="bz-modal-title-step">
                {` · ${stepNum} of ${totalSteps}`}
                {stepLabel ? ` · ${stepLabel}` : ""}
              </span>
            ) : null}
          </h2>
        </div>
        {onClose ? (
          <button
            type="button"
            className="bz-modal-close"
            aria-label="Close dialog (Escape)"
            onClick={onClose}
          >
            <BzIconClose className="bz-modal-close-icon" />
          </button>
        ) : (
          <span className="bz-modal-close bz-modal-close--preview" aria-hidden="true">
            <BzIconClose className="bz-modal-close-icon" />
          </span>
        )}
      </div>

      <div ref={bodyRef} className="bz-modal-body">
        {children}
      </div>

      <div className="bz-modal-footer">{footer}</div>

      {describedBy ? <BzModalShortcutHints id={describedBy} placement="inside" /> : null}
    </div>
  );
}
