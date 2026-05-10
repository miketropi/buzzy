"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { BzComposerModalFrame } from "./bz-composer-modal-frame";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BzComposerModal({
  open,
  onClose,
  title,
  stepIndex,
  totalSteps,
  stepLabels,
  children,
  footer,
  shortcutHints = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  stepIndex: number;
  totalSteps: number;
  stepLabels: string[];
  children: ReactNode;
  footer: ReactNode;
  /** When false, omits Esc / step hint strip (e.g. single-purpose dialogs). */
  shortcutHints?: boolean;
}) {
  const titleId = useId();
  const hintsId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef(false);
  const closingRef = useRef(false);
  const enterScheduledRef = useRef(false);
  const [visible, setVisible] = useState(open);
  const [uiAnim, setUiAnim] = useState<"" | "in" | "out">("");

  useLayoutEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  useEffect(() => {
    if (open) closingRef.current = false;
  }, [open]);

  useLayoutEffect(() => {
    if (!visible) {
      enterScheduledRef.current = false;
      setUiAnim("");
      return;
    }
    if (!open) return;
    if (enterScheduledRef.current) return;
    enterScheduledRef.current = true;
    if (prefersReducedMotion()) {
      setUiAnim("in");
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setUiAnim("in"));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [visible, open]);

  useEffect(() => {
    if (!visible || open || !rootRef.current) return;
    if (closingRef.current) return;
    closingRef.current = true;
    if (prefersReducedMotion()) {
      closingRef.current = false;
      setVisible(false);
      return;
    }
    setUiAnim("out");
  }, [visible, open]);

  useEffect(() => {
    if (uiAnim !== "out" || !rootRef.current) return;
    const col = rootRef.current.querySelector(".bz-modal-column--overlay") as HTMLElement | null;
    if (!col) {
      closingRef.current = false;
      setVisible(false);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      closingRef.current = false;
      setVisible(false);
    };
    const t = window.setTimeout(finish, 420);
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== col) return;
      if (e.propertyName !== "opacity" && e.propertyName !== "transform") return;
      window.clearTimeout(t);
      finish();
    };
    col.addEventListener("transitionend", onEnd);
    return () => {
      window.clearTimeout(t);
      col.removeEventListener("transitionend", onEnd);
    };
  }, [uiAnim]);

  useEffect(() => {
    if (!open) {
      prevOpen.current = false;
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  useEffect(() => {
    if (!open && !visible) {
      prevOpen.current = false;
      return;
    }

    if (!open || !visible) return;

    if (!prevOpen.current) {
      prevOpen.current = true;
      const t = window.setTimeout(() => {
        const sheet = sheetRef.current;
        if (!sheet) return;
        const first =
          sheet.querySelector<HTMLElement>(
            'button:not([disabled]), [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
          ) ?? sheet;
        first.focus();
      }, prefersReducedMotion() ? 0 : 240);
      return () => window.clearTimeout(t);
    }
  }, [open, visible]);

  if (!visible) return null;

  const rootClass =
    `bz-modal-root${uiAnim === "in" ? " bz-modal-root--in" : ""}${uiAnim === "out" ? " bz-modal-root--out" : ""}`.trim();

  return (
    <div ref={rootRef} className={rootClass} role="presentation">
      <button type="button" className="bz-modal-backdrop" aria-label="Close dialog (tap outside)" onClick={onClose} />
      <div className="bz-modal-column bz-modal-column--overlay">
        <BzComposerModalFrame
          titleId={titleId}
          title={title}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
          sheetRef={sheetRef}
          onClose={onClose}
          describedBy={shortcutHints ? hintsId : undefined}
          footer={footer}
        >
          {children}
        </BzComposerModalFrame>
      </div>
    </div>
  );
}
