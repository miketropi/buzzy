"use client";

import type { ReactNode } from "react";

import { BzBellNoticeIcon } from "./bz-icons";

/** Seated-modal hint — notification-style row with icon + copy. */
export function BzModalIntro({ children }: { children: ReactNode }) {
  return (
    <div className="bz-modal-intro" role="status">
      <span className="bz-modal-intro-icon" aria-hidden="true">
        <BzBellNoticeIcon className="bz-modal-intro-ico-svg" />
      </span>
      <p className="bz-modal-intro-text">{children}</p>
    </div>
  );
}
