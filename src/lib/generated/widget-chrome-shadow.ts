/** Auto-generated from src/embed/widget-chrome.css — do not edit. */
export const WIDGET_CHROME_STRUCTURAL_SHADOW = `/**
 * Widget chrome — structural rules only. Theme comes from CSS variables set on \`.bz\`.
 * \`\` is replaced at build time: "" for Shadow DOM, ".buzzy-widget-scope " for dashboard preview.
 */

.bz,
.bz * {
  box-sizing: border-box;
}

.bz {
  /* Spacing + motion primitives (elev —outline / —float emit from injected tokens) */
  --bz-space-1: 0.25rem;
  --bz-space-2: 0.5rem;
  --bz-space-3: 0.75rem;
  --bz-space-4: 1rem;
  --bz-space-5: 1.25rem;
  --bz-space-6: 1.5rem;
  --bz-motion-sm: 0.18s;
  --bz-motion-md: 0.26s;
  --bz-ease-standard: cubic-bezier(0.25, 1, 0.3, 1);
  --bz-ease-tap: cubic-bezier(0.2, 0.8, 0.35, 1);
  --bz-ease-sheet: cubic-bezier(0.22, 1, 0.36, 1);

  font-size: 15px;
  line-height: 1.47;
  color: var(--bz-fg);
  background: var(--bz-bg);
  border-radius: var(--bz-shell-r);
  border: none;
  box-shadow: var(--bz-elev-outline);
  padding: var(--bz-space-4) var(--bz-space-4);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/** Embed main column — one visual frame (.bz); no second boxed “panel”. */
.bz-embed-section {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

/* Section titles — comments, reviews, ratings (iOS “headline” cadence) */
.bz-head {
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.22;
  text-transform: none;
  letter-spacing: -0.03em;
  color: var(--bz-fg);
  margin: 0 0 var(--bz-space-2);
  opacity: 1;
}

@media (min-width: 640px) {
  .bz-head {
    font-size: 1.125rem;
    line-height: 1.2;
  }
}

.bz-msg {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--bz-danger, #b91c1c);
}

.bz-success {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--bz-p);
  font-weight: 600;
}

.bz-panel {
  background: var(--bz-panel);
  border: 1px solid var(--bz-border-soft);
  border-radius: var(--bz-shell-r);
  box-shadow: var(--bz-elev-outline), var(--bz-elev-float-sm);
  padding: 1.35rem 1.4rem;
  margin-bottom: 0;
}

.bz-panel--sm {
  padding: 1.1rem 1.25rem;
}

.bz-card {
  background: var(--bz-input-bg);
  border: 1px solid var(--bz-border-soft);
  border-radius: var(--bz-card-r);
  box-shadow: none;
  padding: 1.05rem 1.15rem;
  margin-bottom: 0;
}

.bz-card:not(.bz-card--surface-flat):not(.bz-card--surface-nested-reply) {
  box-shadow: var(--bz-elev-outline), var(--bz-elev-float);
}

/* Feed list / thread: flat rows (divider) instead of nested boxes */
.bz-card.bz-card--surface-flat {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--bz-ios-separator);
}

.bz-card.bz-card--surface-flat:last-child {
  border-bottom: none;
}

.bz-card.bz-card--surface-flat.bz-thread-card {
  padding: 0.9rem 0;
}

/* iOS-style inset grouped list: multiple flat rows in one rounded surface */
.bz-entry-list-group {
  background: var(--bz-panel);
  border-radius: var(--bz-card-r);
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 82%, transparent); 
  /* box-shadow: var(--bz-elev-outline), var(--bz-elev-float-sm); */
  overflow: hidden;
}

.bz-entry-list-group > .bz-card.bz-card--surface-flat {
  padding: 0.82rem 0.9rem;
}

/* Thread replies: secondary “sub-rows” aligned like iOS threaded detail */
.bz-card.bz-card--surface-nested-reply {
  background: color-mix(in srgb, var(--bz-panel) 22%, var(--bz-bg));
  border: none;
  border-radius: var(--bz-control-r);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bz-ios-separator) 85%, transparent);
  box-sizing: border-box;
}

.bz-thread-card {
  padding: 1rem 1.05rem;
  border-radius: var(--bz-card-r);
  transition:
    border-color var(--bz-motion-sm) var(--bz-ease-standard),
    box-shadow var(--bz-motion-sm) var(--bz-ease-standard);
}

/* Sub-comments: tighter typography + rhythm under a primary row */
.bz-thread-card.bz-card--surface-nested-reply {
  padding: 0.56rem 0.68rem;
}

.bz-thread-card.bz-card--surface-nested-reply .bz-entry-row {
  gap: 0.62rem;
}

.bz-thread-card.bz-card--surface-nested-reply .bz-name--sm {
  font-weight: 600;
}

.bz-thread-card.bz-card--surface-nested-reply .bz-entry-meta {
  font-size: 0.8125rem;
}

/* Nested replies inherit compact typography but show full content (no 3-line clamp). */
.bz-thread-card.bz-card--surface-nested-reply .bz-body--compact,
.bz-thread-card.bz-card--surface-nested-reply .bz-body--comfort {
  display: block;
  margin-top: 0.4rem;
  -webkit-line-clamp: unset;
  -webkit-box-orient: unset;
  overflow: visible;
}

.bz-thread-card.bz-card--surface-nested-reply .bz-actions-row {
  margin-top: 0.62rem;
  padding-top: 0.55rem;
}

@media (hover: hover) and (pointer: fine) {
  .bz-thread-card:not(.bz-card--surface-flat):not(.bz-card--surface-nested-reply):hover {
    border-color: color-mix(in srgb, var(--bz-border) 55%, var(--bz-border-soft));
    box-shadow: var(--bz-elev-outline), var(--bz-elev-float-sm);
  }

  .bz-card.bz-card--surface-flat:hover {
    background: color-mix(in srgb, var(--bz-input-bg) 48%, transparent);
  }

  .bz-entry-list-group .bz-card.bz-card--surface-flat:hover {
    background: color-mix(in srgb, var(--bz-bg) 36%, transparent);
  }

  .bz-card.bz-card--surface-nested-reply:hover {
    background: color-mix(in srgb, var(--bz-panel) 38%, var(--bz-bg));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bz-border-soft) 55%, transparent);
  }
}

.bz-entry-row {
  align-items: flex-start;
}

.bz-entry-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 0.5rem;
  row-gap: 0.2rem;
  line-height: 1.3;
}

.bz-entry-meta {
  color: var(--bz-muted);
  font-weight: 400;
  font-size: 0.875rem;
  letter-spacing: -0.015em;
}

.bz-entry-meta::before {
  content: "·";
  margin-right: 0.42rem;
  font-weight: 700;
  opacity: 0.4;
}

.bz-entry-edited {
  font-size: 0.8125em;
  font-style: italic;
  font-weight: 500;
  color: var(--bz-muted);
  letter-spacing: -0.01em;
}

.bz-meta {
  font-size: 0.8rem;
  color: var(--bz-muted);
}

.bz-body {
  margin: 0.35rem 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.bz-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.bz-av {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 999px;
  background: var(--bz-tint);
  color: var(--bz-fg);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--bz-border-soft) 85%, transparent);
}

.bz-av--lg {
  width: 2.75rem;
  height: 2.75rem;
  font-size: 0.875rem;
}

.bz-av--sm {
  width: 2.25rem;
  height: 2.25rem;
  font-size: 0.75rem;
}

.bz-av--photo {
  padding: 0;
  overflow: hidden;
  background: var(--bz-tint);
}

.bz-av-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}

.bz-stack {
  min-width: 0;
  flex: 1;
}

.bz-name {
  font-weight: 600;
  color: var(--bz-fg);
  letter-spacing: -0.02em;
}

.bz-name--lg {
  font-size: 1rem;
}

.bz-name--sm {
  font-size: 0.875rem;
}

.bz-inline-meta {
  font-size: 0.875rem;
  color: var(--bz-muted);
}

.bz-inline-meta--sm {
  font-size: 0.75rem;
}

.bz-body--comfort {
  margin-top: 0.55rem;
  font-size: 15px;
  line-height: 1.62;
}

.bz-body--compact {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bz-actions {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.bz-reply {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--bz-p);
  cursor: default;
  padding: 0.35rem 0.75rem;
  border-radius: var(--bz-control-r);
  background: color-mix(in srgb, var(--bz-tint) 35%, transparent);
}

.bz-helpful {
  color: var(--bz-muted);
}

.bz-replies {
  margin-top: 0.72rem;
  padding: 0.38rem 0 0 0;
  padding-left: 0.72rem;
  margin-left: 0.15rem;
  /* border-left: 1px solid var(--bz-ios-separator); */
  border-radius: 0;
  display: flex;
  flex-direction: column;
  gap: 0.52rem;
}

@media (min-width: 640px) {
  .bz-replies {
    padding-left: 0.82rem;
    margin-left: 0.18rem;
    gap: 0.58rem;
  }
}

.bz-comp {
  margin-top: 1.65rem;
  padding-top: 1.65rem;
  border-top: none;
}

.bz-section-foot {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}

.bz-l {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0.55rem 0 0.28rem;
  color: var(--bz-fg);
  opacity: 0.88;
}

.bz-composer-heading {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  margin: 0 0 0.35rem;
  color: var(--bz-fg);
}

.bz-composer-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0.55rem 0 0.25rem;
}

.bz-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.32rem 0.62rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--bz-muted);
  background: color-mix(in srgb, var(--bz-panel) 88%, var(--bz-bg));
  border-radius: var(--bz-control-r);
  border: 1px solid var(--bz-border-soft);
}

.bz-composer-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.45rem;
  font-size: 0.72rem;
  color: var(--bz-muted);
}

.bz-in {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid color-mix(in srgb, var(--bz-border) 52%, var(--bz-border-soft));
  border-radius: var(--bz-control-r);
  background: var(--bz-input-bg);
  color: var(--bz-fg);
  font: inherit;
  box-shadow: none;
  transition:
    border-color var(--bz-motion-sm) var(--bz-ease-standard),
    background-color var(--bz-motion-sm) var(--bz-ease-standard);
}

.bz-in:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--bz-border) 70%, var(--bz-border-soft));
}

.bz-in:focus {
  outline: none;
}

.bz-in:focus-visible {
  border-color: color-mix(in srgb, var(--bz-p) 55%, var(--bz-border-soft));
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

textarea.bz-in {
  min-height: 5rem;
  resize: vertical;
}

.bz-btn {
  margin-top: 0.6rem;
  min-height: 2.75rem;
  padding: 0.5rem 1.15rem;
  font-weight: 600;
  font: inherit;
  border: none;
  border-radius: var(--bz-control-r);
  background: var(--bz-p);
  color: var(--bz-btn-fg);
  cursor: pointer;
  transition:
    filter var(--bz-motion-sm) var(--bz-ease-standard),
    transform var(--bz-motion-sm) var(--bz-ease-tap);
}

.bz-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.bz-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.bz-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bz-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-btn--secondary {
  margin-top: 0.6rem;
  min-height: 2.75rem;
  padding: 0.5rem 1.15rem;
  font-weight: 600;
  font: inherit;
  border-radius: var(--bz-control-r);
  background: var(--bz-panel);
  color: var(--bz-p);
  border: 1px solid color-mix(in srgb, var(--bz-p) 38%, var(--bz-border-soft));
  cursor: pointer;
  transition:
    background-color var(--bz-motion-sm) var(--bz-ease-standard),
    border-color var(--bz-motion-sm) var(--bz-ease-standard),
    transform var(--bz-motion-sm) var(--bz-ease-tap);
}

.bz-btn--secondary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-tint) 28%, var(--bz-panel));
  border-color: color-mix(in srgb, var(--bz-border) 55%, var(--bz-border-soft));
}

.bz-btn--secondary:active:not(:disabled) {
  transform: scale(0.98);
}

.bz-btn--secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bz-btn--block {
  width: 100%;
  margin-top: 0;
}

.bz-btn-row {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.bz-btn-row .bz-btn,
.bz-btn-row .bz-btn--secondary {
  margin-top: 0;
}

.bz-stars {
  display: inline-flex;
  gap: 0.2rem;
  flex-wrap: wrap;
  align-items: center;
}

.bz-star-glyph-wrap {
  display: inline-flex;
  vertical-align: middle;
  line-height: 0;
}

.bz-star-glyph-wrap svg {
  width: 1.12em;
  height: 1.12em;
}

.bz-star-row-inline .bz-star-glyph-wrap svg {
  width: 1.04em;
  height: 1.04em;
}

/* Legacy — kept for older embed markup */
.bz-star-char {
  font-size: 1.2rem;
  line-height: 1;
}

.bz-star-char--lg {
  font-size: 1.55rem;
}

.bz-star-btn {
  border: none;
  background: transparent;
  margin: 0;
  padding: 0.12rem;
  min-width: 2.75rem;
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 0;
  color: var(--bz-muted);
  border-radius: var(--bz-control-r);
  transition:
    color var(--bz-motion-sm) var(--bz-ease-standard),
    background-color var(--bz-motion-sm) var(--bz-ease-standard);
}

.bz-star-btn svg {
  width: 1.38rem;
  height: 1.38rem;
}

.bz-star-btn:hover {
  color: color-mix(in srgb, var(--bz-p) 45%, var(--bz-muted));
  background: color-mix(in srgb, var(--bz-tint) 22%, transparent);
}

.bz-star-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-star-btn.bz-sel {
  color: var(--bz-p);
  background: transparent;
}

.bz-star-btn:active {
  opacity: 0.92;
}

.bz-big {
  font-size: 1.85rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 640px) {
  .bz-big {
    font-size: 2.125rem;
  }
}

.bz-sum {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.65rem 1.35rem;
  margin-top: 0.85rem;
}

.bz-sum-head {
  margin-top: 0;
}

.bz-list {
  margin-top: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bz-list:has(> .bz-card--surface-flat) {
  gap: 0;
}

.bz-list:has(> .bz-entry-list-group) {
  gap: 0;
}

@media (min-width: 640px) {
  .bz-list {
    gap: 1rem;
  }

  .bz-list:has(> .bz-card--surface-flat) {
    gap: 0;
  }

  .bz-list:has(> .bz-entry-list-group) {
    gap: 0;
  }
}

.bz-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .bz-grid--2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

.bz-carousel-hint {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--bz-muted);
}

.bz-carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.25rem 0 1rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}

.bz-carousel-card {
  min-width: min(100%, 18rem);
  flex-shrink: 0;
  scroll-snap-align: start;
}

@media (min-width: 640px) {
  .bz-carousel-card {
    min-width: 20rem;
  }
}

@media (min-width: 768px) {
  .bz-carousel-card {
    min-width: 22rem;
  }
}

.bz-carousel-label {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--bz-muted);
}

.bz-rating-row .bz-l {
  margin-top: 0;
}

/* Official / staff reply under a review card */
.bz-staff-reply {
  margin-top: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--bz-control-r);
  border: 1px solid var(--bz-border-soft);
  background: color-mix(in srgb, var(--bz-panel) 35%, var(--bz-tint));
}
.bz-staff-reply-label {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.01em;
  color: var(--bz-muted);
}
.bz-staff-reply .bz-prose {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
}
.bz-staff-reply .bz-body--plain {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
}

.bz-star-row-inline {
  display: inline-flex;
  gap: 0.125rem;
  vertical-align: middle;
}

.bz-flex-between {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* Layout helpers — use inside .bz / Shadow DOM (no host Tailwind). */

.bz-inline-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.75rem;
  row-gap: 0.25rem;
}

.bz-main-stack {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

@media (min-width: 640px) {
  .bz-main-stack {
    gap: 1.25rem;
  }
}

.bz-thread-entries {
  margin-top: 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.bz-composer-stars-wrap {
  margin-top: 0.25rem;
}

.bz-composer-stars-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.bz-composer-stars-label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--bz-muted);
}

@media (min-width: 640px) {
  .bz-composer-stars-label {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

.bz-composer-stars-label--lg {
  font-weight: 500;
}

.bz-rating-center-sm {
  margin-top: 0.25rem;
  display: flex;
  justify-content: center;
}

@media (min-width: 640px) {
  .bz-rating-center-sm {
    justify-content: flex-start;
  }
}

.bz-hint-sm {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: var(--bz-muted);
}

@media (min-width: 640px) {
  .bz-hint-sm {
    font-size: 0.875rem;
    line-height: 1.375rem;
  }
}

.bz-comp-block {
  margin-top: 0;
}

.bz-icon-sm {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Rich text (TipTap / html_content), votes, reply / quote actions */

.bz-prose {
  line-height: 1.55;
}

.bz-prose p {
  margin: 0.35rem 0;
}

.bz-prose p:first-child {
  margin-top: 0;
}

.bz-prose p:last-child {
  margin-bottom: 0;
}

.bz-prose a {
  color: var(--bz-link);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.bz-prose ul,
.bz-prose ol {
  margin: 0.35rem 0;
  padding-left: 1.25rem;
}

/* Blockquote — iOS/macOS grouped secondary surface + leading capsule (Mail / Notes–adjacent) */
.bz-prose blockquote,
.bz-tiptap blockquote {
  position: relative;
  margin: var(--bz-space-3) 0;
  padding: var(--bz-space-3) var(--bz-space-3) var(--bz-space-3)
    calc(var(--bz-space-3) + 0.65rem);
  border: none;
  border-radius: var(--bz-card-r);
  background: color-mix(in srgb, var(--bz-fg) 3.5%, var(--bz-panel));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bz-ios-separator) 92%, transparent);
  color: color-mix(in srgb, var(--bz-fg) 52%, var(--bz-muted));
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 400;
  letter-spacing: -0.011em;
  line-height: 1.47;
  -webkit-font-smoothing: antialiased;
}

.bz-prose blockquote::before,
.bz-tiptap blockquote::before {
  content: "";
  position: absolute;
  left: 0.55rem;
  top: var(--bz-space-2);
  bottom: var(--bz-space-2);
  width: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bz-p) 38%, var(--bz-ios-separator));
  pointer-events: none;
}

.bz-prose blockquote strong,
.bz-tiptap blockquote strong {
  color: color-mix(in srgb, var(--bz-fg) 90%, var(--bz-muted));
  font-weight: 600;
}

.bz-prose blockquote code,
.bz-tiptap blockquote code {
  font-style: normal;
}

.bz-prose blockquote > p,
.bz-tiptap blockquote > p {
  margin: 0.28rem 0;
}

.bz-prose blockquote > p:first-child,
.bz-tiptap blockquote > p:first-child {
  margin-top: 0;
}

.bz-prose blockquote > p:last-child,
.bz-tiptap blockquote > p:last-child {
  margin-bottom: 0;
}

/*
 * Composer modal (“Post a comment”, etc.) — editor sits on \`--bz-input-bg\`; nudge quote
 * fill toward \`--bz-bg\` so grouped secondary reads like iOS inset content vs the field.
 */
.bz-modal-body .bz-tiptap blockquote {
  background: color-mix(in srgb, var(--bz-bg) 44%, var(--bz-input-bg));
  color: color-mix(in srgb, var(--bz-fg) 48%, var(--bz-muted));
}

.bz-modal-body .bz-tiptap blockquote::before {
  background: color-mix(in srgb, var(--bz-p) 42%, var(--bz-ios-separator));
}

.bz-prose code {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace;
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  border-radius: calc(var(--bz-r) * 0.4);
  background: var(--bz-tint);
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 78%, transparent);
}

.bz-prose pre {
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  overflow-x: auto;
  border-radius: calc(var(--bz-r) * 0.6);
  background: color-mix(in srgb, var(--bz-panel) 62%, var(--bz-input-bg));
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 85%, transparent);
  font-size: 0.85rem;
  line-height: 1.45;
}

.bz-prose pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

.bz-prose h2,
.bz-prose h3,
.bz-prose h4 {
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: -0.02em;
  margin: 0.55rem 0 0.25rem;
  color: inherit;
}

.bz-prose h2:first-child,
.bz-prose h3:first-child,
.bz-prose h4:first-child {
  margin-top: 0;
}

.bz-prose h2 {
  font-size: 1.14em;
}

.bz-prose h3 {
  font-size: 1.04em;
}

.bz-prose h4 {
  font-size: 1em;
  font-weight: 600;
}

.bz-prose hr {
  border: none;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 88%, transparent);
  margin: 0.55rem 0;
}

.bz-prose strong {
  font-weight: 700;
}

.bz-prose em {
  font-style: italic;
}

.bz-prose s,
.bz-prose strike {
  text-decoration: line-through;
}

.bz-prose u {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.bz-prose li {
  margin: 0.18em 0;
}

.bz-prose li::marker {
  color: color-mix(in srgb, var(--bz-muted) 75%, var(--bz-fg));
}

.bz-prose li p {
  margin: 0.14em 0;
}

.bz-prose li p:first-child {
  margin-top: 0;
}

.bz-prose li p:last-child {
  margin-bottom: 0;
}

.bz-inline-img {
  max-width: 100%;
  height: auto;
  border-radius: calc(var(--bz-r) * 0.6);
  margin: 0.35rem 0;
}

.bz-inline-video {
  max-width: 100%;
  width: 100%;
  max-height: 20rem;
  border-radius: calc(var(--bz-r) * 0.6);
  margin: 0.35rem 0;
  display: block;
  background: var(--bz-tint);
}

.bz-prose video,
.bz-tiptap video {
  max-width: 100%;
  max-height: 20rem;
  border-radius: calc(var(--bz-r) * 0.6);
  margin: 0.35rem 0;
}

.bz-editor-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.bz-composer-surface {
  margin-top: 0.35rem;
  border-radius: var(--bz-control-r);
  background: var(--bz-input-bg);
  border: 1px solid color-mix(in srgb, var(--bz-border) 35%, var(--bz-border-soft));
  overflow: hidden;
}

.bz-composer-editor-body {
  padding: 0.65rem 0.85rem 0.85rem;
}

.bz-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.5rem;
  background: color-mix(in srgb, var(--bz-panel) 50%, transparent);
  border-bottom: 1px solid var(--bz-border-soft);
}

.bz-editor-toolbar-btn {
  min-width: 1.65rem;
  padding: 0.28rem 0.5rem;
  border: none;
  border-radius: calc(var(--bz-r) * 0.55);
  background: transparent;
  font: inherit;
  font-size: 0.78rem;
  line-height: 1.2;
  font-weight: 600;
  color: inherit;
  cursor: pointer;
}

.bz-editor-toolbar-btn:hover:not(:disabled) {
  background: var(--bz-tint);
}

.bz-editor-toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bz-editor-toolbar-btn--active {
  background: color-mix(in srgb, var(--bz-p) 22%, transparent);
  color: var(--bz-p);
}

.bz-editor-toolbar-btn--fake {
  pointer-events: none;
  opacity: 0.72;
  cursor: default;
  font-weight: 500;
}

.bz-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.bz-tiptap {
  min-height: 5.75rem;
  outline: none;
  font: inherit;
  line-height: 1.55;
}

.bz-tiptap p {
  margin: 0.35rem 0;
}

.bz-tiptap p:first-child {
  margin-top: 0;
}

.bz-tiptap p:last-child {
  margin-bottom: 0;
}

.bz-tiptap h2,
.bz-tiptap h3,
.bz-tiptap h4 {
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: -0.02em;
  margin: 0.6rem 0 0.28rem;
  color: var(--bz-fg);
}

.bz-tiptap h2:first-child,
.bz-tiptap h3:first-child,
.bz-tiptap h4:first-child {
  margin-top: 0;
}

.bz-tiptap h2 {
  font-size: 1.14em;
}

.bz-tiptap h3 {
  font-size: 1.04em;
}

.bz-tiptap h4 {
  font-size: 1em;
  font-weight: 600;
}

.bz-tiptap hr {
  border: none;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 88%, transparent);
  margin: 0.6rem 0;
}

.bz-tiptap a {
  color: var(--bz-link);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  cursor: pointer;
}

.bz-tiptap strong {
  font-weight: 700;
}

.bz-tiptap em {
  font-style: italic;
}

.bz-tiptap s,
.bz-tiptap strike {
  text-decoration: line-through;
}

.bz-tiptap u {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.bz-tiptap ul,
.bz-tiptap ol {
  margin: 0.35rem 0;
  padding-left: 1.35rem;
}

.bz-tiptap li {
  margin: 0.18em 0;
}

.bz-tiptap li::marker {
  color: color-mix(in srgb, var(--bz-muted) 75%, var(--bz-fg));
}

.bz-tiptap li p {
  margin: 0.14em 0;
}

.bz-tiptap li p:first-child {
  margin-top: 0;
}

.bz-tiptap li p:last-child {
  margin-bottom: 0;
}

.bz-tiptap code {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace;
  font-size: 0.875em;
  padding: 0.1em 0.38em;
  border-radius: calc(var(--bz-r) * 0.4);
  background: color-mix(in srgb, var(--bz-tint) 88%, var(--bz-panel));
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 78%, transparent);
}

.bz-tiptap pre {
  margin: 0.5rem 0;
  padding: 0.55rem 0.75rem;
  overflow-x: auto;
  border-radius: calc(var(--bz-r) * 0.65);
  background: color-mix(in srgb, var(--bz-panel) 62%, var(--bz-input-bg));
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 85%, transparent);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.bz-tiptap pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

.bz-tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--bz-muted);
  pointer-events: none;
  height: 0;
}

.bz-link {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: var(--bz-link);
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0.25em;
  transition:
    color var(--bz-motion-sm) var(--bz-ease-standard),
    opacity var(--bz-motion-sm) var(--bz-ease-standard);
}

.bz-link:hover:not(:disabled) {
  color: color-mix(in srgb, var(--bz-link) 82%, var(--bz-fg));
  opacity: 0.92;
}

.bz-link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bz-reply-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: color-mix(in srgb, var(--bz-tint) 30%, transparent);
  padding: 0.4rem 0.75rem;
  font: inherit;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--bz-link);
  cursor: pointer;
  border-radius: var(--bz-control-r);
  min-height: 2.5rem;
  transition:
    background-color var(--bz-motion-sm) var(--bz-ease-standard),
    transform var(--bz-motion-sm) var(--bz-ease-tap);
}

@media (pointer: coarse) {
  .bz-reply-btn {
    min-height: 2.75rem;
    padding: 0.45rem 0.95rem;
  }

  .bz-vote-btn {
    min-height: 2.5rem;
    padding: 0.38rem 0.75rem;
    font-size: 0.8125rem;
  }

  .bz-actions-row .bz-link {
    min-height: 2.75rem;
    padding: 0.35rem 0.25rem;
    display: inline-flex;
    align-items: center;
  }
}

.bz-reply-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-tint) 75%, transparent);
}

.bz-reply-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.bz-reply-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bz-votes {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.bz-vote-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid color-mix(in srgb, var(--bz-border) 40%, var(--bz-border-soft));
  background: color-mix(in srgb, var(--bz-panel) 40%, var(--bz-input-bg));
  color: var(--bz-fg);
  border-radius: var(--bz-control-r);
  padding: 0.35rem 0.72rem;
  min-height: 2.5rem;
  font: inherit;
  font-size: 0.78125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background-color var(--bz-motion-sm) var(--bz-ease-standard),
    border-color var(--bz-motion-sm) var(--bz-ease-standard),
    color var(--bz-motion-sm) var(--bz-ease-standard);
}

.bz-vote-btn .bz-vote-ico {
  flex-shrink: 0;
}

.bz-vote-btn:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--bz-border) 75%, var(--bz-border-soft));
  background: color-mix(in srgb, var(--bz-panel) 35%, var(--bz-input-bg));
}

.bz-vote-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-vote-btn.bz-sel {
  background: var(--bz-tint);
  color: var(--bz-p);
  border-color: color-mix(in srgb, var(--bz-p) 45%, var(--bz-border-soft));
}

.bz-vote-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bz-actions-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.65rem;
  margin-top: 0.85rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--bz-ios-separator);
}

/* Attachments (composer panel + queued previews) */

.bz-attachments-panel {
  margin-top: 0.15rem;
}

.bz-attachments-drop {
  border: 1px dashed var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1.1);
  padding: 0.95rem 1.1rem;
  text-align: center;
  background: color-mix(in srgb, var(--bz-tint) 35%, var(--bz-input-bg));
}

.bz-attachments-drop--off {
  opacity: 0.65;
  pointer-events: none;
}

.bz-attachments-drop-label {
  margin: 0 0 0.65rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--bz-muted);
}

.bz-attachments-choose-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0.45rem 1rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bz-link);
  background: var(--bz-panel);
  border: 1px solid color-mix(in srgb, var(--bz-p) 32%, var(--bz-border-soft));
  border-radius: var(--bz-control-r);
  cursor: pointer;
}

.bz-attachments-choose-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bz-attachments-err {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--bz-danger, #b91c1c);
}

.bz-attachments-queue {
  margin-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bz-attachments-section {
  min-width: 0;
}

.bz-attachments-section-title {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bz-muted);
}

.bz-attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: 0.5rem;
}

.bz-attachments-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(4.75rem, 1fr));
}

.bz-attachments-queue-item {
  position: relative;
  border-radius: calc(var(--bz-r) * 0.95);
  border: 1px solid var(--bz-border-soft);
  box-shadow: none;
  overflow: hidden;
  background: var(--bz-panel);
}

.bz-attachments-queue-item--video {
  position: relative;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 0.95);
  overflow: hidden;
  box-shadow: none;
}

.bz-attachments-thumb-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--bz-tint);
}

.bz-attachments-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bz-attachments-pending-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(1px);
}

.bz-attachments-pending-overlay--video {
  pointer-events: none;
}

.bz-attachments-pending-overlay--err {
  padding: 0.35rem;
  background: rgba(0, 0, 0, 0.55);
}

.bz-attachments-pending-err {
  font-size: 0.65rem;
  line-height: 1.25;
  color: #fff;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.bz-attachments-spin {
  width: 1.35rem;
  height: 1.35rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: bz-attachments-spin 0.65s linear infinite;
}

.bz-attachments-spin--inline {
  width: 0.85rem;
  height: 0.85rem;
  border-width: 2px;
  vertical-align: -0.15em;
  margin-right: 0.35rem;
  display: inline-block;
}

@keyframes bz-attachments-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bz-attachments-spin,
  .bz-attachments-spin--inline {
    animation: none;
    border-top-color: rgba(255, 255, 255, 0.55);
  }
}

.bz-attachments-remove {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  width: 1.35rem;
  height: 1.35rem;
  padding: 0;
  border: none;
  border-radius: calc(var(--bz-r) * 0.5);
  font: inherit;
  font-size: 1rem;
  line-height: 1;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.bz-attachments-remove:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.bz-attachments-videos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bz-attachments-video {
  width: 100%;
  max-height: 12rem;
  display: block;
  background: var(--bz-tint);
}

.bz-attachments-docs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.bz-attachments-doc-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  margin-bottom: 0.35rem;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 0.85);
  background: var(--bz-input-bg);
  position: relative;
  padding-right: 2rem;
}

.bz-attachments-doc-row--pending {
  flex-wrap: wrap;
}

.bz-attachments-doc-name {
  flex: 1;
  min-width: 0;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bz-attachments-doc-status {
  flex-basis: 100%;
  font-size: 0.72rem;
  color: var(--bz-muted);
  display: flex;
  align-items: center;
}

.bz-attachments-doc-status--err {
  color: var(--bz-danger, #b91c1c);
}

/* Read-only attachment blocks on cards */

.bz-attachments-display {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Attachment lightbox (cards + “Quick Look” sheet) */

.bz-attachments-thumb-trigger {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--bz-tint);
  border-radius: calc(var(--bz-r) * 0.95);
  overflow: hidden;
  border: 1px solid var(--bz-border-soft);
  box-shadow: none;
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
  vertical-align: baseline;
  text-align: inherit;
  -webkit-tap-highlight-color: transparent;
}

.bz-attachments-thumb-trigger:focus-visible {
  outline: 2px solid var(--bz-ring);
  outline-offset: 2px;
}

.bz-attachments-thumb-trigger:hover:not(:disabled) {
  filter: brightness(0.98);
}

.bz-attachments-video-trigger {
  position: relative;
  display: block;
  width: 100%;
  max-height: 12rem;
  margin: 0;
  padding: 0;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 0.95);
  overflow: hidden;
  cursor: pointer;
  background: var(--bz-tint);
  font: inherit;
  -webkit-tap-highlight-color: transparent;
}

.bz-attachments-video-trigger:focus-visible {
  outline: 2px solid var(--bz-ring);
  outline-offset: 2px;
}

.bz-attachments-video-poster {
  width: 100%;
  height: 100%;
  max-height: 12rem;
  object-fit: cover;
  display: block;
  pointer-events: none;
  background: var(--bz-tint);
}

.bz-attachments-video-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.07), rgba(0, 0, 0, 0.16));
}

.bz-attachments-video-play-ico {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.35));
}

.bz-attachments-doc-trigger {
  width: 100%;
  margin-bottom: 0.35rem;
  padding: 0.5rem 0.72rem;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 0.95);
  background: var(--bz-input-bg);
  color: var(--bz-link);
  font: inherit;
  font-size: 0.8rem;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.bz-attachments-doc-trigger:hover:not(:disabled) {
  background: var(--bz-tint);
}

.bz-attachments-doc-trigger:focus-visible {
  outline: 2px solid var(--bz-ring);
  outline-offset: 2px;
}

/* Media lightbox overlay — frosted backdrop, rounded sheet */

.bz-media-lightbox-root {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(0.85rem, env(safe-area-inset-top, 0px)) max(1rem, env(safe-area-inset-right, 0px))
    max(1rem, env(safe-area-inset-bottom, 0px)) max(1rem, env(safe-area-inset-left, 0px));
  font-family: inherit;
  box-sizing: border-box;
  opacity: 0;
  transition: opacity var(--bz-motion-md) var(--bz-ease-standard);
}

.bz-media-lightbox-root--shown {
  opacity: 1;
}

.bz-media-lightbox-backdrop {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: rgba(10, 14, 26, 0.36);
  cursor: pointer;
  -webkit-backdrop-filter: saturate(200%) blur(24px);
  backdrop-filter: saturate(200%) blur(24px);
}

.bz-media-lightbox-panel {
  position: relative;
  z-index: 1;
  width: min(100%, 36rem);
  max-height: min(90vh, 56rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: color-mix(in srgb, var(--bz-bg) 88%, transparent);
  color: var(--bz-fg);
  border-radius: var(--bz-shell-r);
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 70%, transparent);
  box-shadow: var(--bz-elev-outline), var(--bz-elev-float-sm);
  transform: scale(0.97) translateY(6px);
  transition:
    transform var(--bz-motion-md) var(--bz-ease-standard),
    box-shadow var(--bz-motion-md) var(--bz-ease-standard);
}

.bz-media-lightbox-root--shown .bz-media-lightbox-panel {
  transform: scale(1) translateY(0);
  box-shadow: var(--bz-elev-outline), var(--bz-elev-float);
}

.bz-media-lightbox-close {
  position: absolute;
  top: max(0.6rem, env(safe-area-inset-top, 0px));
  right: 0.6rem;
  z-index: 2;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  font: inherit;
  cursor: pointer;
  color: var(--bz-fg);
  background: color-mix(in srgb, var(--bz-muted, #64748b) 12%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  -webkit-tap-highlight-color: transparent;
}

.bz-media-lightbox-close:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-muted, #64748b) 20%, transparent);
}

.bz-media-lightbox-close:focus-visible {
  outline: 2px solid var(--bz-ring);
  outline-offset: 2px;
}

.bz-media-lightbox-close-glyph {
  font-size: 0.92rem;
  line-height: 1;
  font-weight: 500;
  opacity: 0.72;
}

.bz-media-lightbox-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.6rem 0.95rem 0.85rem;
  gap: 0.65rem;
}

.bz-media-lightbox-img,
.bz-media-lightbox-video {
  max-width: 100%;
  max-height: min(68vh, 520px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--bz-card-r);
  background: var(--bz-tint);
}

.bz-media-lightbox-frame {
  width: 100%;
  flex: 1;
  min-height: min(60vh, 480px);
  border-radius: var(--bz-card-r);
  overflow: hidden;
  background: var(--bz-panel);
}

.bz-media-lightbox-iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: min(58vh, 460px);
  border: none;
  border-radius: var(--bz-card-r);
  background: var(--bz-input-bg);
}

.bz-media-lightbox-file-fallback {
  text-align: center;
  padding: 1rem 1.25rem 0.75rem;
  max-width: 18rem;
}

.bz-media-lightbox-file-hint {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.35;
  color: var(--bz-muted);
}

.bz-media-lightbox-footer {
  flex-shrink: 0;
  padding: 0.55rem 1rem 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  column-gap: 0.85rem;
  row-gap: 0.35rem;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 55%, transparent);
  background: color-mix(in srgb, var(--bz-panel) 40%, var(--bz-bg));
}

.bz-media-lightbox-caption {
  margin: 0;
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--bz-fg) 78%, transparent);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
}

.bz-media-lightbox-open-link {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--bz-link);
  text-decoration: none;
}

.bz-media-lightbox-open-link:hover {
  text-decoration: underline;
}

.bz-media-lightbox-open-link:focus-visible {
  outline: 2px solid var(--bz-ring);
  outline-offset: 3px;
  border-radius: var(--bz-control-r);
}

@media (max-width: 420px) {
  .bz-media-lightbox-caption {
    flex-basis: 100%;
    text-align: center;
    white-space: normal;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bz-media-lightbox-root,
  .bz-media-lightbox-panel {
    transition: none !important;
  }

  .bz-media-lightbox-root--shown .bz-media-lightbox-panel,
  .bz-media-lightbox-panel {
    transform: none !important;
  }

  .bz-media-lightbox-root--shown {
    opacity: 1;
  }

  .bz-media-lightbox-root {
    opacity: 0;
  }

  .bz-media-lightbox-root.bz-media-lightbox-root--shown {
    opacity: 1;
  }
}

/* Composer modal (multi-step comment / review) */

.bz-comp--cta {
  margin-top: 1.35rem;
  padding-top: 1.35rem;
  border-top: 1px solid var(--bz-ios-separator);
}

.bz-comp-reply-hint {
  margin: 0 0 0.65rem;
}

.bz-modal-root {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
  font-family: inherit;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.bz-modal-column {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: min(36rem, 100%);
  gap: 0.5rem;
  padding: 0 0 max(0.65rem, env(safe-area-inset-bottom, 0px));
}

.bz-modal-column--overlay {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity var(--bz-motion-md) var(--bz-ease-sheet),
    transform var(--bz-motion-md) var(--bz-ease-sheet);
}

.bz-modal-root--in .bz-modal-column--overlay {
  opacity: 1;
  transform: translateY(0);
}

.bz-modal-root--out .bz-modal-column--overlay {
  opacity: 0;
  transform: translateY(10px);
  transition-duration: var(--bz-motion-md);
}

@media (prefers-reduced-motion: reduce) {
  .bz-modal-backdrop,
  .bz-modal-column--overlay {
    transition: none !important;
  }

  .bz-modal-root--in .bz-modal-backdrop,
  .bz-modal-root--in .bz-modal-column--overlay {
    opacity: 1;
  }

  .bz-modal-root--in .bz-modal-column--overlay {
    transform: none;
  }

  .bz-modal-root--out .bz-modal-backdrop,
  .bz-modal-root--out .bz-modal-column--overlay {
    opacity: 0;
  }
}

@media (min-width: 640px) {
  .bz-modal-root {
    justify-content: center;
    padding: 1.25rem;
  }

  .bz-modal-column {
    max-width: min(40rem, calc(100vw - 2.5rem));
    padding-bottom: 0;
  }
}

.bz-modal-stack-inline {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1.1rem;
}

.bz-modal-stack-inline .bz-modal-sheet--inline {
  margin-top: 0;
}

.bz-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  border: none;
  padding: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.42);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--bz-motion-md) var(--bz-ease-standard);
  -webkit-backdrop-filter: saturate(200%) blur(16px);
  backdrop-filter: saturate(200%) blur(16px);
}

.bz-modal-root--in .bz-modal-backdrop {
  opacity: 1;
}

.bz-modal-root--out .bz-modal-backdrop {
  opacity: 0;
  transition-duration: var(--bz-motion-md);
}

.bz-modal-sheet {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(36rem, 100%);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--bz-panel);
  color: var(--bz-fg);
  border: none;
  border-radius: var(--bz-sheet-r-m) var(--bz-sheet-r-m) 0 0;
  box-shadow:
    0 -1px 0 color-mix(in srgb, var(--bz-border-soft) 90%, transparent),
    var(--bz-elev-float);
}

.bz-modal-sheet:not(.bz-modal-sheet--inline) {
  max-height: min(92dvh, 52rem);
}

@media (min-width: 640px) {
  .bz-modal-sheet {
    max-width: min(40rem, calc(100vw - 2.5rem));
    border-radius: var(--bz-shell-r);
    box-shadow: var(--bz-elev-outline), var(--bz-elev-float);
    overflow: hidden;
  }
}

.bz-modal-grab {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 0.55rem 1rem 0.15rem;
}

.bz-modal-grab-bar {
  width: 2.375rem;
  height: 0.28rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bz-muted) 42%, transparent);
}

@media (min-width: 640px) {
  .bz-modal-grab {
    display: none;
  }
}

.bz-modal-sheet--inline {
  max-height: none;
  margin-top: 1.1rem;
  border-radius: var(--bz-control-r);
  background: var(--bz-input-bg);
  box-shadow: none;
}

.bz-modal-sheet--inline .bz-modal-grab {
  display: none;
}

.bz-modal-close--preview {
  pointer-events: none;
  opacity: 0.65;
}

.bz-modal-inline-caption {
  margin: 0.65rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
}

.bz-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.35rem 1.1rem 0.85rem 1.25rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--bz-ios-separator);
}

.bz-modal-header-main {
  min-width: 0;
  flex: 1;
}

.bz-modal-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.22;
  letter-spacing: -0.03em;
}

.bz-modal-title-primary {
  font: inherit;
  letter-spacing: inherit;
}

.bz-modal-title-step {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--bz-muted);
}

@media (min-width: 640px) {
  .bz-modal-title {
    font-size: 1.125rem;
    line-height: 1.2;
  }

  .bz-modal-title-step {
    font-size: 0.84375rem;
  }

  .bz-modal-header {
    padding: 0.5rem 1.2rem 1rem 1.35rem;
  }
}

.bz-modal-subtitle {
  margin: 0.28rem 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bz-muted);
}


.bz-modal-close {
  flex-shrink: 0;
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -0.15rem -0.15rem 0 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--bz-muted);
  font: inherit;
  cursor: pointer;
  transition:
    background-color var(--bz-motion-sm) var(--bz-ease-standard),
    color var(--bz-motion-sm) var(--bz-ease-standard);
}

.bz-modal-close-icon {
  display: block;
  flex-shrink: 0;
}

.bz-modal-close:hover {
  background: var(--bz-tint);
  color: var(--bz-fg);
}

.bz-modal-close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-modal-hint-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35rem 0.55rem;
  padding: 0.55rem 1rem;
  flex-shrink: 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--bz-muted);
}

.bz-modal-hint-strip--inside {
  margin-top: 0;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 92%, transparent);
  background: color-mix(in srgb, var(--bz-bg) 78%, var(--bz-panel));
  padding: 0.45rem 1rem calc(0.5rem + env(safe-area-inset-bottom, 0px));
  border-radius: 0;
  font-size: 0.72rem;
}

@media (min-width: 640px) {
  .bz-modal-hint-strip--inside {
    padding: 0.5rem 1.25rem calc(0.55rem + env(safe-area-inset-bottom, 0px));
    /* Match seated modal sheet (.bz-modal-sheet) bottom corners — var(--bz-shell-r) */
    border-radius: 0 0 var(--bz-shell-r) var(--bz-shell-r);
  }
}

/* Inline composer sheet (.bz-modal-sheet--inline) uses --bz-control-r; hint foot matches */
.bz-modal-sheet--inline .bz-modal-hint-strip--inside {
  border-radius: 0 0 var(--bz-control-r) var(--bz-control-r);
}

.bz-modal-hint-strip--below {
  margin: 0 auto;
  max-width: min(36rem, 100%);
  padding: 0.6rem 1rem;
  font-size: 0.72rem;
  line-height: 1.45;
  color: color-mix(in srgb, var(--bz-fg) 72%, var(--bz-muted));
  background: color-mix(in srgb, var(--bz-panel) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 85%, transparent);
  border-radius: var(--bz-card-r);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

@media (min-width: 640px) {
  .bz-modal-hint-strip--below {
    max-width: min(40rem, calc(100vw - 2.5rem));
  }
}

.bz-modal-hint-item {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.bz-modal-hint-item-text {
  color: inherit;
}

.bz-modal-hint-sep {
  color: var(--bz-border);
  user-select: none;
}

.bz-modal-hint-sep--hide-sm {
  display: none;
}

@media (min-width: 400px) {
  .bz-modal-hint-sep--hide-sm {
    display: inline;
  }
}

.bz-modal-hint-item--wrap {
  flex: 1 1 100%;
  justify-content: center;
  text-align: center;
}

@media (min-width: 520px) {
  .bz-modal-hint-item--wrap {
    flex: 0 1 auto;
    text-align: left;
  }
}

.bz-modal-hint-short {
  display: inline;
}

.bz-modal-hint-long {
  display: none;
}

@media (min-width: 520px) {
  .bz-modal-hint-short {
    display: none;
  }

  .bz-modal-hint-long {
    display: inline;
  }
}

.bz-kbd {
  display: inline-block;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
  padding: 0.2rem 0.45rem;
  border-radius: var(--bz-control-r);
  border: 1px solid var(--bz-border-soft);
  background: var(--bz-panel);
  color: var(--bz-fg);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--bz-fg) 6%, transparent);
}

.bz-modal-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem 1.25rem 1.35rem;
}

/* Grouped label + control — consistent vertical rhythm in composer modals */
.bz-modal-body .bz-form-field {
  margin-bottom: 1.1rem;
}

/* Host SSO — read-only profile row in composer step 1 */
.bz-host-identity-summary {
  margin-bottom: 1.1rem;
}

.bz-host-identity-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.38rem;
}

.bz-host-identity-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--bz-control-r);
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 82%, transparent);
}

.bz-host-identity-text {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.bz-host-identity-name {
  font-weight: 600;
  font-size: 0.9375rem;
  letter-spacing: -0.015em;
  color: var(--bz-fg);
}

.bz-host-identity-email {
  font-size: 0.8125rem;
  color: var(--bz-muted);
  word-break: break-word;
}

.bz-host-identity-hint {
  margin: 0.45rem 0 0;
  font-size: 0.75rem;
  line-height: 1.38;
  color: var(--bz-muted);
}

.bz-modal-body .bz-form-field:last-child {
  margin-bottom: 0;
}

.bz-modal-body .bz-form-field .bz-l {
  display: block;
  margin: 0 0 0.45rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--bz-fg);
  opacity: 0.88;
}

.bz-rating-input {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 2.75rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--bz-border-soft);
  border-radius: var(--bz-control-r);
  background: var(--bz-input-bg);
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.bz-rating-input:hover {
  border-color: color-mix(in srgb, var(--bz-border) 70%, var(--bz-border-soft));
}

.bz-rating-input:focus-within {
  outline: none;
  border-color: color-mix(in srgb, var(--bz-p) 55%, var(--bz-border-soft));
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.bz-rating-input .bz-stars {
  gap: 0.06rem;
}

.bz-rating-input .bz-star-btn {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.12rem;
  border-radius: var(--bz-control-r);
}

.bz-rating-input .bz-star-btn svg {
  width: 1.26rem;
  height: 1.26rem;
}

.bz-modal-body .bz-msg {
  margin-bottom: 0.75rem;
}

/* Modal intro — notification banner: icon well + elevated card on sheet */
.bz-modal-body .bz-modal-intro {
  display: flex;
  align-items: flex-start;
  gap: 0.62rem;
  margin: 0 0 1rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--bz-card-r);
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 86%, transparent);
  background: color-mix(in srgb, var(--bz-panel) 78%, var(--bz-input-bg));
  box-shadow: var(--bz-elev-outline), var(--bz-elev-float-sm);
  -webkit-font-smoothing: antialiased;
}

.bz-modal-body .bz-modal-intro-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  margin-top: 0.06rem;
  border-radius: var(--bz-control-r);
  background: color-mix(in srgb, var(--bz-p) 20%, var(--bz-panel));
  color: color-mix(in srgb, var(--bz-p) 78%, var(--bz-fg));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bz-p) 28%, transparent);
}

.bz-modal-body .bz-modal-intro-ico-svg {
  width: 1.1rem;
  height: 1.1rem;
  display: block;
}

.bz-modal-body .bz-modal-intro-text {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.014em;
  color: color-mix(in srgb, var(--bz-fg) 90%, var(--bz-muted));
}

.bz-modal-body .bz-modal-intro-text strong {
  font-weight: 600;
  color: color-mix(in srgb, var(--bz-fg) 96%, var(--bz-muted));
}

.bz-modal-body .bz-in {
  min-height: 2.75rem;
  padding: 0.65rem 0.9rem;
  font-size: 0.9375rem;
}

.bz-modal-body textarea.bz-in {
  min-height: 6.75rem;
}

.bz-modal-body .bz-form-field .bz-composer-surface {
  margin-top: 0;
}

.bz-modal-body .bz-composer-surface {
  margin-top: 0.5rem;
}

.bz-modal-body .bz-tiptap {
  min-height: 6.75rem;
}

@keyframes bz-modal-body-step {
  from {
    opacity: 0.45;
    transform: translateY(7px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bz-modal-body--step-in {
  animation: bz-modal-body-step var(--bz-motion-md) ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .bz-modal-body--step-in {
    animation: none;
  }
}

.bz-modal-footer {
  flex-shrink: 0;
  padding: 1rem 1.25rem 1rem;
  border-top: 1px solid var(--bz-ios-separator);
  background: color-mix(in srgb, var(--bz-panel) 88%, var(--bz-bg));
  border-radius: 0;
  box-shadow: 0 -1px 0 color-mix(in srgb, var(--bz-ios-separator) 55%, transparent);
}

.bz-modal-sheet--inline .bz-modal-footer {
  border-radius: 0;
  box-shadow: none;
}

@media (min-width: 640px) {
  .bz-modal-footer {
    border-radius: 0;
    box-shadow: none;
  }
}

.bz-modal-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;
}

.bz-modal-footer-inner .bz-btn.bz-btn--modal,
.bz-modal-footer-inner .bz-btn--secondary.bz-btn--modal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  margin-top: 0;
  min-height: 2.75rem;
  padding: 0.55rem 1.15rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  border-radius: var(--bz-control-r);
}

.bz-modal-footer-inner .bz-btn--modal .bz-ico {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
  opacity: 0.88;
}

.bz-modal-footer-inner .bz-btn--modal-primary.bz-btn:not(:disabled) {
  box-shadow: 0 1px 2px color-mix(in srgb, var(--bz-p) 25%, transparent),
    0 2px 8px color-mix(in srgb, var(--bz-p) 18%, transparent);
}

.bz-modal-footer-inner .bz-btn--modal-primary.bz-btn:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 2px 4px color-mix(in srgb, var(--bz-p) 28%, transparent),
    0 4px 14px color-mix(in srgb, var(--bz-p) 22%, transparent);
}

.bz-modal-footer-inner .bz-btn--secondary.bz-btn--modal {
  background: transparent;
  border-color: transparent;
  color: var(--bz-muted);
  box-shadow: none;
}

.bz-modal-footer-inner .bz-btn--secondary.bz-btn--modal:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-tint) 38%, transparent);
  border-color: transparent;
  color: var(--bz-fg);
}

.bz-modal-footer-inner .bz-btn,
.bz-modal-footer-inner .bz-btn--secondary {
  margin-top: 0;
  flex: 1 1 auto;
  min-width: 7rem;
}

@media (min-width: 480px) {
  .bz-modal-footer-inner .bz-btn,
  .bz-modal-footer-inner .bz-btn--secondary {
    flex: 0 1 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bz-btn,
  .bz-btn--secondary,
  .bz-reply-btn,
  .bz-in,
  .bz-star-btn,
  .bz-vote-btn,
  .bz-link,
  .bz-modal-close,
  .bz-thread-card {
    transition-duration: 0.01ms !important;
  }

  .bz-btn:active:not(:disabled),
  .bz-btn--secondary:active:not(:disabled),
  .bz-reply-btn:active:not(:disabled) {
    transform: none;
  }
}
`;
