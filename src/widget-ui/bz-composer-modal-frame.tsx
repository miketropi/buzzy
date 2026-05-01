"use client";

import type { LegacyRef, ReactNode } from "react";
import { useEffect, useRef } from "react";

export function BzModalShortcutHints({ id, below }: { id: string; below?: boolean }) {
  return (
    <div
      id={id}
      className={`bz-modal-hint-strip${below ? " bz-modal-hint-strip--below" : ""}`}
      role="note"
    >
      <span className="bz-modal-hint-item">
        <kbd className="bz-kbd">Esc</kbd>
        <span className="bz-modal-hint-item-text"> closes</span>
      </span>
      <span className="bz-modal-hint-sep" aria-hidden>
        ·
      </span>
      <span className="bz-modal-hint-item">Tap outside to close</span>
      <span className="bz-modal-hint-sep" aria-hidden>
        ·
      </span>
      <span className="bz-modal-hint-item">Two steps — text first, files optional after</span>
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
  /** Optional id of shortcut hints (may live outside the sheet when `below`). */
  describedBy?: string;
}) {
  const safeStep = Math.min(Math.max(0, stepIndex), Math.max(0, totalSteps - 1));
  const stepNum = safeStep + 1;
  const showProgress = totalSteps > 1;
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
      <div className="bz-modal-header">
        <h2 id={titleId} className="bz-modal-title">
          {title}
        </h2>
        {onClose ? (
          <button
            type="button"
            className="bz-modal-close"
            aria-label="Close dialog (Escape)"
            onClick={onClose}
          >
            ×
          </button>
        ) : (
          <span className="bz-modal-close bz-modal-close--preview" aria-hidden="true">
            ×
          </span>
        )}
      </div>

      {showProgress ? (
        <div
          className="bz-modal-progress"
          role="group"
          aria-label={`Step ${stepNum} of ${totalSteps}`}
        >
          <div className="bz-modal-progress-head">
            <span className="bz-modal-progress-count">
              Step {stepNum} of {totalSteps}
            </span>
          </div>
          <div className="bz-modal-progress-track" aria-hidden>
            {Array.from({ length: totalSteps }, (_, i) => {
              const done = i < safeStep;
              const current = i === safeStep;
              return (
                <div
                  key={i}
                  className={`bz-modal-progress-seg${done ? " bz-modal-progress-seg--done" : ""}${current ? " bz-modal-progress-seg--current" : ""}`}
                />
              );
            })}
          </div>
          {stepLabels[safeStep] ? (
            <p className="bz-modal-step-label">{stepLabels[safeStep]}</p>
          ) : null}
        </div>
      ) : null}

      <div ref={bodyRef} className="bz-modal-body">
        {children}
      </div>

      <div className="bz-modal-footer">{footer}</div>
    </div>
  );
}
