/** Auto-generated from src/embed/widget-chrome.css — do not edit. */
export const WIDGET_CHROME_STRUCTURAL_SCOPED = `/**
 * Widget chrome — structural rules only. Theme comes from CSS variables set on \`.bz\`.
 * \`.buzzy-widget-scope \` is replaced at build time: "" for Shadow DOM, ".buzzy-widget-scope " for dashboard preview.
 */

.buzzy-widget-scope .bz,
.buzzy-widget-scope .bz * {
  box-sizing: border-box;
}

.buzzy-widget-scope .bz {
  font-size: 15px;
  line-height: 1.5;
  color: var(--bz-fg);
  background: var(--bz-bg);
  border-radius: calc(var(--bz-r) * 1.2);
  border: none;
  box-shadow: none;
  padding: 1.25rem 1.35rem;
}

/* Section titles — comments, reviews, ratings */
.buzzy-widget-scope .bz-head {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.02em;
  color: var(--bz-fg);
  margin: 0 0 0.65rem;
  opacity: 0.92;
}

.buzzy-widget-scope .bz-msg {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--bz-danger, #b91c1c);
}

.buzzy-widget-scope .bz-success {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--bz-p);
  font-weight: 600;
}

.buzzy-widget-scope .bz-panel {
  background: var(--bz-panel);
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1.25);
  box-shadow: none;
  padding: 1.35rem 1.4rem;
  margin-bottom: 0;
}

.buzzy-widget-scope .bz-panel--sm {
  padding: 1.1rem 1.25rem;
}

.buzzy-widget-scope .bz-card {
  background: var(--bz-input-bg);
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1.2);
  box-shadow: none;
  padding: 1.05rem 1.15rem;
  margin-bottom: 0;
}

/* Comment / review thread entry cards */
.buzzy-widget-scope .bz-thread-card {
  padding: 1rem 1.05rem;
  border-radius: calc(var(--bz-r) * 1.35);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

@media (hover: hover) and (pointer: fine) {
  .buzzy-widget-scope .bz-thread-card:hover {
    border-color: color-mix(in srgb, var(--bz-border) 55%, var(--bz-border-soft));
    box-shadow: 0 1px 0 color-mix(in srgb, var(--bz-fg) 4%, transparent);
  }
}

.buzzy-widget-scope .bz-entry-row {
  align-items: flex-start;
}

.buzzy-widget-scope .bz-entry-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 0.5rem;
  row-gap: 0.2rem;
  line-height: 1.3;
}

.buzzy-widget-scope .bz-entry-meta {
  color: var(--bz-muted);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.buzzy-widget-scope .bz-entry-meta::before {
  content: "·";
  margin-right: 0.42rem;
  font-weight: 700;
  opacity: 0.4;
}

.buzzy-widget-scope .bz-entry-edited {
  font-size: 0.8125em;
  font-style: italic;
  font-weight: 500;
  color: var(--bz-muted);
  letter-spacing: -0.01em;
}

.buzzy-widget-scope .bz-meta {
  font-size: 0.8rem;
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-body {
  margin: 0.35rem 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.buzzy-widget-scope .bz-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.buzzy-widget-scope .bz-av {
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

.buzzy-widget-scope .bz-av--lg {
  width: 2.75rem;
  height: 2.75rem;
  font-size: 0.875rem;
}

.buzzy-widget-scope .bz-av--sm {
  width: 2.25rem;
  height: 2.25rem;
  font-size: 0.75rem;
}

.buzzy-widget-scope .bz-stack {
  min-width: 0;
  flex: 1;
}

.buzzy-widget-scope .bz-name {
  font-weight: 600;
  color: var(--bz-fg);
  letter-spacing: -0.02em;
}

.buzzy-widget-scope .bz-name--lg {
  font-size: 1rem;
}

.buzzy-widget-scope .bz-name--sm {
  font-size: 0.875rem;
}

.buzzy-widget-scope .bz-inline-meta {
  font-size: 0.875rem;
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-inline-meta--sm {
  font-size: 0.75rem;
}

.buzzy-widget-scope .bz-body--comfort {
  margin-top: 0.55rem;
  font-size: 15px;
  line-height: 1.62;
}

.buzzy-widget-scope .bz-body--compact {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.buzzy-widget-scope .bz-actions {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.buzzy-widget-scope .bz-reply {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--bz-p);
  cursor: default;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bz-tint) 35%, transparent);
}

.buzzy-widget-scope .bz-helpful {
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-replies {
  margin-top: 0.85rem;
  padding: 0.65rem 0 0.15rem 0.95rem;
  margin-left: 0.15rem;
  border-left: 3px solid color-mix(in srgb, var(--bz-p) 22%, var(--bz-border-soft));
  border-radius: 0 calc(var(--bz-r) * 0.85) calc(var(--bz-r) * 0.85) 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.buzzy-widget-scope .bz-replies .bz-thread-card {
  padding: 0.85rem 0.95rem;
  background: color-mix(in srgb, var(--bz-panel) 22%, var(--bz-input-bg));
  border-color: color-mix(in srgb, var(--bz-border-soft) 92%, var(--bz-border));
  border-radius: calc(var(--bz-r) * 1.05);
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-replies {
    padding-left: 1.1rem;
    margin-left: 0.2rem;
    gap: 0.75rem;
  }
}

.buzzy-widget-scope .bz-comp {
  margin-top: 1.65rem;
  padding-top: 1.65rem;
  border-top: none;
}

.buzzy-widget-scope .bz-section-foot {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}

.buzzy-widget-scope .bz-l {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0.55rem 0 0.28rem;
  color: var(--bz-fg);
  opacity: 0.88;
}

.buzzy-widget-scope .bz-composer-heading {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  margin: 0 0 0.35rem;
  color: var(--bz-fg);
}

.buzzy-widget-scope .bz-composer-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0.55rem 0 0.25rem;
}

.buzzy-widget-scope .bz-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--bz-muted);
  background: var(--bz-panel);
  border-radius: 999px;
  border: 1px solid var(--bz-border-soft);
}

.buzzy-widget-scope .bz-composer-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.45rem;
  font-size: 0.72rem;
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-in {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1);
  background: var(--bz-input-bg);
  color: var(--bz-fg);
  font: inherit;
  box-shadow: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.buzzy-widget-scope .bz-in:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--bz-border) 70%, var(--bz-border-soft));
}

.buzzy-widget-scope .bz-in:focus {
  outline: none;
}

.buzzy-widget-scope .bz-in:focus-visible {
  border-color: color-mix(in srgb, var(--bz-p) 55%, var(--bz-border-soft));
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope textarea.bz-in {
  min-height: 5rem;
  resize: vertical;
}

.buzzy-widget-scope .bz-btn {
  margin-top: 0.6rem;
  min-height: 2.5rem;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  font: inherit;
  border: none;
  border-radius: calc(var(--bz-r) * 1.5);
  background: var(--bz-p);
  color: var(--bz-btn-fg);
  cursor: pointer;
  transition:
    filter 0.15s ease,
    transform 0.1s ease;
}

.buzzy-widget-scope .bz-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.buzzy-widget-scope .bz-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.buzzy-widget-scope .bz-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-btn--secondary {
  margin-top: 0.6rem;
  min-height: 2.5rem;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  font: inherit;
  border-radius: calc(var(--bz-r) * 1.5);
  background: var(--bz-input-bg);
  color: var(--bz-fg);
  border: 1px solid var(--bz-border-soft);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease;
}

.buzzy-widget-scope .bz-btn--secondary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-tint) 45%, var(--bz-panel));
  border-color: color-mix(in srgb, var(--bz-border) 80%, var(--bz-border-soft));
}

.buzzy-widget-scope .bz-btn--secondary:active:not(:disabled) {
  transform: scale(0.98);
}

.buzzy-widget-scope .bz-btn--secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-btn--block {
  width: 100%;
  margin-top: 0;
}

.buzzy-widget-scope .bz-btn-row {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.buzzy-widget-scope .bz-btn-row .bz-btn,
.buzzy-widget-scope .bz-btn-row .bz-btn--secondary {
  margin-top: 0;
}

.buzzy-widget-scope .bz-stars {
  display: inline-flex;
  gap: 0.2rem;
  flex-wrap: wrap;
  align-items: center;
}

.buzzy-widget-scope .bz-star-glyph-wrap {
  display: inline-flex;
  vertical-align: middle;
  line-height: 0;
}

.buzzy-widget-scope .bz-star-glyph-wrap svg {
  width: 1.12em;
  height: 1.12em;
}

.buzzy-widget-scope .bz-star-row-inline .bz-star-glyph-wrap svg {
  width: 1.04em;
  height: 1.04em;
}

/* Legacy — kept for older embed markup */
.buzzy-widget-scope .bz-star-char {
  font-size: 1.2rem;
  line-height: 1;
}

.buzzy-widget-scope .bz-star-char--lg {
  font-size: 1.55rem;
}

.buzzy-widget-scope .bz-star-btn {
  border: none;
  background: transparent;
  margin: 0;
  padding: 0.2rem;
  min-width: 2.25rem;
  min-height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 0;
  color: var(--bz-muted);
  border-radius: 0.55rem;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.buzzy-widget-scope .bz-star-btn svg {
  width: 1.38rem;
  height: 1.38rem;
}

.buzzy-widget-scope .bz-star-btn:hover {
  color: color-mix(in srgb, var(--bz-p) 45%, var(--bz-muted));
  background: color-mix(in srgb, var(--bz-tint) 22%, transparent);
}

.buzzy-widget-scope .bz-star-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-star-btn.bz-sel {
  color: var(--bz-p);
  background: transparent;
}

.buzzy-widget-scope .bz-star-btn:active {
  opacity: 0.92;
}

.buzzy-widget-scope .bz-big {
  font-size: 1.85rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-big {
    font-size: 2.125rem;
  }
}

.buzzy-widget-scope .bz-sum {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.65rem 1.35rem;
  margin-top: 0.85rem;
}

.buzzy-widget-scope .bz-sum-head {
  margin-top: 0;
}

.buzzy-widget-scope .bz-list {
  margin-top: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-list {
    gap: 1rem;
  }
}

.buzzy-widget-scope .bz-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-grid--2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

.buzzy-widget-scope .bz-carousel-hint {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.25rem 0 1rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}

.buzzy-widget-scope .bz-carousel-card {
  min-width: min(100%, 18rem);
  flex-shrink: 0;
  scroll-snap-align: start;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-carousel-card {
    min-width: 20rem;
  }
}

@media (min-width: 768px) {
  .buzzy-widget-scope .bz-carousel-card {
    min-width: 22rem;
  }
}

.buzzy-widget-scope .bz-carousel-label {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-rating-row .bz-l {
  margin-top: 0;
}

/* Official / staff reply under a review card */
.buzzy-widget-scope .bz-staff-reply {
  margin-top: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: calc(var(--bz-r) * 0.95);
  border: 1px solid var(--bz-border-soft);
  background: var(--bz-tint);
}
.buzzy-widget-scope .bz-staff-reply-label {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.01em;
  color: var(--bz-muted);
}
.buzzy-widget-scope .bz-staff-reply .bz-prose {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
}
.buzzy-widget-scope .bz-staff-reply .bz-body--plain {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
}

.buzzy-widget-scope .bz-star-row-inline {
  display: inline-flex;
  gap: 0.125rem;
  vertical-align: middle;
}

.buzzy-widget-scope .bz-flex-between {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* Layout helpers — use inside .bz / Shadow DOM (no host Tailwind). */

.buzzy-widget-scope .bz-inline-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.75rem;
  row-gap: 0.25rem;
}

.buzzy-widget-scope .bz-main-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-main-stack {
    gap: 1.65rem;
  }
}

.buzzy-widget-scope .bz-thread-entries {
  margin-top: 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-thread-entries {
    gap: 0.95rem;
  }
}

.buzzy-widget-scope .bz-composer-stars-wrap {
  margin-top: 0.25rem;
}

.buzzy-widget-scope .bz-composer-stars-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.buzzy-widget-scope .bz-composer-stars-label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--bz-muted);
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-composer-stars-label {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

.buzzy-widget-scope .bz-composer-stars-label--lg {
  font-weight: 500;
}

.buzzy-widget-scope .bz-rating-center-sm {
  margin-top: 0.25rem;
  display: flex;
  justify-content: center;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-rating-center-sm {
    justify-content: flex-start;
  }
}

.buzzy-widget-scope .bz-hint-sm {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: var(--bz-muted);
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-hint-sm {
    font-size: 0.875rem;
    line-height: 1.375rem;
  }
}

.buzzy-widget-scope .bz-comp-block {
  margin-top: 0;
}

.buzzy-widget-scope .bz-icon-sm {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Rich text (TipTap / html_content), votes, reply / quote actions */

.buzzy-widget-scope .bz-prose {
  line-height: 1.55;
}

.buzzy-widget-scope .bz-prose p {
  margin: 0.35rem 0;
}

.buzzy-widget-scope .bz-prose p:first-child {
  margin-top: 0;
}

.buzzy-widget-scope .bz-prose p:last-child {
  margin-bottom: 0;
}

.buzzy-widget-scope .bz-prose a {
  color: var(--bz-p);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.buzzy-widget-scope .bz-prose ul,
.buzzy-widget-scope .bz-prose ol {
  margin: 0.35rem 0;
  padding-left: 1.25rem;
}

.buzzy-widget-scope .bz-prose blockquote {
  margin: 0.5rem 0;
  padding: 0.35rem 0.75rem;
  border-left: 3px solid var(--bz-p);
  background: var(--bz-tint);
  border-radius: calc(var(--bz-r) * 0.5);
}

.buzzy-widget-scope .bz-prose code {
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

.buzzy-widget-scope .bz-prose pre {
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  overflow-x: auto;
  border-radius: calc(var(--bz-r) * 0.6);
  background: color-mix(in srgb, var(--bz-panel) 62%, var(--bz-input-bg));
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 85%, transparent);
  font-size: 0.85rem;
  line-height: 1.45;
}

.buzzy-widget-scope .bz-prose pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

.buzzy-widget-scope .bz-prose h2,
.buzzy-widget-scope .bz-prose h3,
.buzzy-widget-scope .bz-prose h4 {
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: -0.02em;
  margin: 0.55rem 0 0.25rem;
  color: inherit;
}

.buzzy-widget-scope .bz-prose h2:first-child,
.buzzy-widget-scope .bz-prose h3:first-child,
.buzzy-widget-scope .bz-prose h4:first-child {
  margin-top: 0;
}

.buzzy-widget-scope .bz-prose h2 {
  font-size: 1.14em;
}

.buzzy-widget-scope .bz-prose h3 {
  font-size: 1.04em;
}

.buzzy-widget-scope .bz-prose h4 {
  font-size: 1em;
  font-weight: 600;
}

.buzzy-widget-scope .bz-prose hr {
  border: none;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 88%, transparent);
  margin: 0.55rem 0;
}

.buzzy-widget-scope .bz-prose strong {
  font-weight: 700;
}

.buzzy-widget-scope .bz-prose em {
  font-style: italic;
}

.buzzy-widget-scope .bz-prose s,
.buzzy-widget-scope .bz-prose strike {
  text-decoration: line-through;
}

.buzzy-widget-scope .bz-prose u {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.buzzy-widget-scope .bz-prose li {
  margin: 0.18em 0;
}

.buzzy-widget-scope .bz-prose li::marker {
  color: color-mix(in srgb, var(--bz-muted) 75%, var(--bz-fg));
}

.buzzy-widget-scope .bz-prose li p {
  margin: 0.14em 0;
}

.buzzy-widget-scope .bz-prose li p:first-child {
  margin-top: 0;
}

.buzzy-widget-scope .bz-prose li p:last-child {
  margin-bottom: 0;
}

.buzzy-widget-scope .bz-inline-img {
  max-width: 100%;
  height: auto;
  border-radius: calc(var(--bz-r) * 0.6);
  margin: 0.35rem 0;
}

.buzzy-widget-scope .bz-inline-video {
  max-width: 100%;
  width: 100%;
  max-height: 20rem;
  border-radius: calc(var(--bz-r) * 0.6);
  margin: 0.35rem 0;
  display: block;
  background: var(--bz-tint);
}

.buzzy-widget-scope .bz-prose video,
.buzzy-widget-scope .bz-tiptap video {
  max-width: 100%;
  max-height: 20rem;
  border-radius: calc(var(--bz-r) * 0.6);
  margin: 0.35rem 0;
}

.buzzy-widget-scope .bz-editor-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.buzzy-widget-scope .bz-composer-surface {
  margin-top: 0.35rem;
  border-radius: calc(var(--bz-r) * 1.15);
  background: var(--bz-input-bg);
  border: 1px solid var(--bz-border-soft);
  overflow: hidden;
}

.buzzy-widget-scope .bz-composer-editor-body {
  padding: 0.65rem 0.85rem 0.85rem;
}

.buzzy-widget-scope .bz-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.5rem;
  background: color-mix(in srgb, var(--bz-panel) 50%, transparent);
  border-bottom: 1px solid var(--bz-border-soft);
}

.buzzy-widget-scope .bz-editor-toolbar-btn {
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

.buzzy-widget-scope .bz-editor-toolbar-btn:hover:not(:disabled) {
  background: var(--bz-tint);
}

.buzzy-widget-scope .bz-editor-toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-editor-toolbar-btn--active {
  background: color-mix(in srgb, var(--bz-p) 22%, transparent);
  color: var(--bz-p);
}

.buzzy-widget-scope .bz-editor-toolbar-btn--fake {
  pointer-events: none;
  opacity: 0.72;
  cursor: default;
  font-weight: 500;
}

.buzzy-widget-scope .bz-sr-only {
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

.buzzy-widget-scope .bz-tiptap {
  min-height: 5.75rem;
  outline: none;
  font: inherit;
  line-height: 1.55;
}

.buzzy-widget-scope .bz-tiptap p {
  margin: 0.35rem 0;
}

.buzzy-widget-scope .bz-tiptap p:first-child {
  margin-top: 0;
}

.buzzy-widget-scope .bz-tiptap p:last-child {
  margin-bottom: 0;
}

.buzzy-widget-scope .bz-tiptap h2,
.buzzy-widget-scope .bz-tiptap h3,
.buzzy-widget-scope .bz-tiptap h4 {
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: -0.02em;
  margin: 0.6rem 0 0.28rem;
  color: var(--bz-fg);
}

.buzzy-widget-scope .bz-tiptap h2:first-child,
.buzzy-widget-scope .bz-tiptap h3:first-child,
.buzzy-widget-scope .bz-tiptap h4:first-child {
  margin-top: 0;
}

.buzzy-widget-scope .bz-tiptap h2 {
  font-size: 1.14em;
}

.buzzy-widget-scope .bz-tiptap h3 {
  font-size: 1.04em;
}

.buzzy-widget-scope .bz-tiptap h4 {
  font-size: 1em;
  font-weight: 600;
}

.buzzy-widget-scope .bz-tiptap hr {
  border: none;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 88%, transparent);
  margin: 0.6rem 0;
}

.buzzy-widget-scope .bz-tiptap a {
  color: var(--bz-p);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  cursor: pointer;
}

.buzzy-widget-scope .bz-tiptap strong {
  font-weight: 700;
}

.buzzy-widget-scope .bz-tiptap em {
  font-style: italic;
}

.buzzy-widget-scope .bz-tiptap s,
.buzzy-widget-scope .bz-tiptap strike {
  text-decoration: line-through;
}

.buzzy-widget-scope .bz-tiptap u {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.buzzy-widget-scope .bz-tiptap ul,
.buzzy-widget-scope .bz-tiptap ol {
  margin: 0.35rem 0;
  padding-left: 1.35rem;
}

.buzzy-widget-scope .bz-tiptap li {
  margin: 0.18em 0;
}

.buzzy-widget-scope .bz-tiptap li::marker {
  color: color-mix(in srgb, var(--bz-muted) 75%, var(--bz-fg));
}

.buzzy-widget-scope .bz-tiptap li p {
  margin: 0.14em 0;
}

.buzzy-widget-scope .bz-tiptap li p:first-child {
  margin-top: 0;
}

.buzzy-widget-scope .bz-tiptap li p:last-child {
  margin-bottom: 0;
}

.buzzy-widget-scope .bz-tiptap blockquote {
  margin: 0.5rem 0;
  padding: 0.35rem 0.75rem;
  border-left: 3px solid var(--bz-p);
  background: var(--bz-tint);
  border-radius: calc(var(--bz-r) * 0.5);
}

.buzzy-widget-scope .bz-tiptap code {
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

.buzzy-widget-scope .bz-tiptap pre {
  margin: 0.5rem 0;
  padding: 0.55rem 0.75rem;
  overflow-x: auto;
  border-radius: calc(var(--bz-r) * 0.65);
  background: color-mix(in srgb, var(--bz-panel) 62%, var(--bz-input-bg));
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 85%, transparent);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.buzzy-widget-scope .bz-tiptap pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

.buzzy-widget-scope .bz-tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--bz-muted);
  pointer-events: none;
  height: 0;
}

.buzzy-widget-scope .bz-link {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: var(--bz-p);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  font-weight: 500;
  border-radius: 0.25em;
  transition: color 0.12s ease;
}

.buzzy-widget-scope .bz-link:hover:not(:disabled) {
  color: color-mix(in srgb, var(--bz-p) 85%, var(--bz-fg));
}

.buzzy-widget-scope .bz-link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-reply-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: color-mix(in srgb, var(--bz-tint) 35%, transparent);
  padding: 0.38rem 0.8rem;
  font: inherit;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--bz-p);
  cursor: pointer;
  border-radius: 999px;
  transition:
    background-color 0.12s ease,
    transform 0.1s ease;
}

@media (pointer: coarse) {
  .buzzy-widget-scope .bz-reply-btn {
    min-height: 2.75rem;
    padding: 0.45rem 0.95rem;
  }

  .buzzy-widget-scope .bz-vote-btn {
    min-height: 2.5rem;
    padding: 0.38rem 0.75rem;
    font-size: 0.8125rem;
  }

  .buzzy-widget-scope .bz-actions-row .bz-link {
    min-height: 2.75rem;
    padding: 0.35rem 0.25rem;
    display: inline-flex;
    align-items: center;
  }
}

.buzzy-widget-scope .bz-reply-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-tint) 75%, transparent);
}

.buzzy-widget-scope .bz-reply-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.buzzy-widget-scope .bz-reply-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-votes {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.buzzy-widget-scope .bz-vote-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--bz-border-soft);
  background: var(--bz-input-bg);
  color: var(--bz-fg);
  border-radius: 999px;
  padding: 0.32rem 0.65rem;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease;
}

.buzzy-widget-scope .bz-vote-btn .bz-vote-ico {
  flex-shrink: 0;
}

.buzzy-widget-scope .bz-vote-btn:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--bz-border) 75%, var(--bz-border-soft));
  background: color-mix(in srgb, var(--bz-panel) 35%, var(--bz-input-bg));
}

.buzzy-widget-scope .bz-vote-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-vote-btn.bz-sel {
  background: var(--bz-tint);
  color: var(--bz-p);
  border-color: color-mix(in srgb, var(--bz-p) 45%, var(--bz-border-soft));
}

.buzzy-widget-scope .bz-vote-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-actions-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.65rem;
  margin-top: 0.85rem;
  padding-top: 0.7rem;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 88%, transparent);
}

/* Attachments (composer panel + queued previews) */

.buzzy-widget-scope .bz-attachments-panel {
  margin-top: 0.15rem;
}

.buzzy-widget-scope .bz-attachments-drop {
  border: 1px dashed var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1.1);
  padding: 0.95rem 1.1rem;
  text-align: center;
  background: color-mix(in srgb, var(--bz-tint) 35%, var(--bz-input-bg));
}

.buzzy-widget-scope .bz-attachments-drop--off {
  opacity: 0.65;
  pointer-events: none;
}

.buzzy-widget-scope .bz-attachments-drop-label {
  margin: 0 0 0.65rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-attachments-choose-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0.42rem 0.95rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bz-p);
  background: var(--bz-panel);
  border: 1px solid color-mix(in srgb, var(--bz-p) 40%, var(--bz-border-soft));
  border-radius: calc(var(--bz-r) * 1.2);
  cursor: pointer;
}

.buzzy-widget-scope .bz-attachments-choose-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-attachments-err {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--bz-danger, #b91c1c);
}

.buzzy-widget-scope .bz-attachments-queue {
  margin-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.buzzy-widget-scope .bz-attachments-section {
  min-width: 0;
}

.buzzy-widget-scope .bz-attachments-section-title {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bz-muted);
}

.buzzy-widget-scope .bz-attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: 0.5rem;
}

.buzzy-widget-scope .bz-attachments-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(4.75rem, 1fr));
}

.buzzy-widget-scope .bz-attachments-queue-item {
  position: relative;
  border-radius: calc(var(--bz-r) * 0.95);
  border: 1px solid var(--bz-border-soft);
  box-shadow: none;
  overflow: hidden;
  background: var(--bz-panel);
}

.buzzy-widget-scope .bz-attachments-queue-item--video {
  position: relative;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 0.95);
  overflow: hidden;
  box-shadow: none;
}

.buzzy-widget-scope .bz-attachments-thumb-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--bz-tint);
}

.buzzy-widget-scope .bz-attachments-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.buzzy-widget-scope .bz-attachments-pending-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(1px);
}

.buzzy-widget-scope .bz-attachments-pending-overlay--video {
  pointer-events: none;
}

.buzzy-widget-scope .bz-attachments-pending-overlay--err {
  padding: 0.35rem;
  background: rgba(0, 0, 0, 0.55);
}

.buzzy-widget-scope .bz-attachments-pending-err {
  font-size: 0.65rem;
  line-height: 1.25;
  color: #fff;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.buzzy-widget-scope .bz-attachments-spin {
  width: 1.35rem;
  height: 1.35rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: bz-attachments-spin 0.65s linear infinite;
}

.buzzy-widget-scope .bz-attachments-spin--inline {
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

.buzzy-widget-scope .bz-attachments-remove {
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

.buzzy-widget-scope .bz-attachments-remove:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.buzzy-widget-scope .bz-attachments-videos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.buzzy-widget-scope .bz-attachments-video {
  width: 100%;
  max-height: 12rem;
  display: block;
  background: var(--bz-tint);
}

.buzzy-widget-scope .bz-attachments-docs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.buzzy-widget-scope .bz-attachments-doc-row {
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

.buzzy-widget-scope .bz-attachments-doc-row--pending {
  flex-wrap: wrap;
}

.buzzy-widget-scope .bz-attachments-doc-name {
  flex: 1;
  min-width: 0;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.buzzy-widget-scope .bz-attachments-doc-status {
  flex-basis: 100%;
  font-size: 0.72rem;
  color: var(--bz-muted);
  display: flex;
  align-items: center;
}

.buzzy-widget-scope .bz-attachments-doc-status--err {
  color: var(--bz-danger, #b91c1c);
}

/* Read-only attachment blocks on cards */

.buzzy-widget-scope .bz-attachments-display {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Composer modal (multi-step comment / review) */

.buzzy-widget-scope .bz-comp--cta {
  margin-top: 1.35rem;
  padding-top: 1.35rem;
  border-top: 1px solid var(--bz-border-soft);
}

.buzzy-widget-scope .bz-comp-reply-hint {
  margin: 0 0 0.65rem;
}

.buzzy-widget-scope .bz-modal-root {
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

.buzzy-widget-scope .bz-modal-column {
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

.buzzy-widget-scope .bz-modal-column--overlay {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.buzzy-widget-scope .bz-modal-root--in .bz-modal-column--overlay {
  opacity: 1;
  transform: translateY(0);
}

.buzzy-widget-scope .bz-modal-root--out .bz-modal-column--overlay {
  opacity: 0;
  transform: translateY(10px);
  transition-duration: 0.22s;
}

@media (prefers-reduced-motion: reduce) {
  .buzzy-widget-scope .bz-modal-backdrop,
  .buzzy-widget-scope .bz-modal-column--overlay {
    transition: none !important;
  }

  .buzzy-widget-scope .bz-modal-root--in .bz-modal-backdrop,
  .buzzy-widget-scope .bz-modal-root--in .bz-modal-column--overlay {
    opacity: 1;
  }

  .buzzy-widget-scope .bz-modal-root--in .bz-modal-column--overlay {
    transform: none;
  }

  .buzzy-widget-scope .bz-modal-root--out .bz-modal-backdrop,
  .buzzy-widget-scope .bz-modal-root--out .bz-modal-column--overlay {
    opacity: 0;
  }
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-modal-root {
    justify-content: center;
    padding: 1.25rem;
  }

  .buzzy-widget-scope .bz-modal-column {
    max-width: min(40rem, calc(100vw - 2.5rem));
    padding-bottom: 0;
  }
}

.buzzy-widget-scope .bz-modal-stack-inline {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1.1rem;
}

.buzzy-widget-scope .bz-modal-stack-inline .bz-modal-sheet--inline {
  margin-top: 0;
}

.buzzy-widget-scope .bz-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  border: none;
  padding: 0;
  margin: 0;
  background: rgba(15, 23, 42, 0.42);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.22s ease-out;
}

.buzzy-widget-scope .bz-modal-root--in .bz-modal-backdrop {
  opacity: 1;
}

.buzzy-widget-scope .bz-modal-root--out .bz-modal-backdrop {
  opacity: 0;
  transition-duration: 0.2s;
}

.buzzy-widget-scope .bz-modal-sheet {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(36rem, 100%);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--bz-bg);
  color: var(--bz-fg);
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1.35) calc(var(--bz-r) * 1.35) 0 0;
  box-shadow:
    0 -10px 44px rgba(15, 23, 42, 0.14),
    0 -1px 0 rgba(15, 23, 42, 0.05);
}

.buzzy-widget-scope .bz-modal-sheet:not(.bz-modal-sheet--inline) {
  max-height: min(92dvh, 52rem);
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-modal-sheet {
    max-width: min(40rem, calc(100vw - 2.5rem));
    border-radius: calc(var(--bz-r) * 1.35);
    box-shadow:
      0 28px 56px rgba(15, 23, 42, 0.16),
      0 0 0 1px color-mix(in srgb, var(--bz-border-soft) 70%, transparent);
  }
}

.buzzy-widget-scope .bz-modal-grab {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 0.55rem 1rem 0.15rem;
}

.buzzy-widget-scope .bz-modal-grab-bar {
  width: 2.25rem;
  height: 0.22rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bz-muted) 35%, var(--bz-border-soft));
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-modal-grab {
    display: none;
  }
}

.buzzy-widget-scope .bz-modal-sheet--inline {
  max-height: none;
  margin-top: 1.1rem;
  border-radius: calc(var(--bz-r) * 1.15);
  background: var(--bz-input-bg);
  box-shadow: none;
}

.buzzy-widget-scope .bz-modal-sheet--inline .bz-modal-grab {
  display: none;
}

.buzzy-widget-scope .bz-modal-close--preview {
  pointer-events: none;
  opacity: 0.65;
}

.buzzy-widget-scope .bz-modal-inline-caption {
  margin: 0.65rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
}

.buzzy-widget-scope .bz-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.35rem 1.1rem 0.85rem 1.25rem;
  flex-shrink: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--bz-border-soft) 88%, transparent);
}

.buzzy-widget-scope .bz-modal-header-main {
  min-width: 0;
  flex: 1;
}

.buzzy-widget-scope .bz-modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.03em;
}

.buzzy-widget-scope .bz-modal-title-primary {
  font: inherit;
  letter-spacing: inherit;
}

.buzzy-widget-scope .bz-modal-title-step {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--bz-muted);
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-modal-title {
    font-size: 1.25rem;
  }

  .buzzy-widget-scope .bz-modal-title-step {
    font-size: 0.84375rem;
  }

  .buzzy-widget-scope .bz-modal-header {
    padding: 0.5rem 1.2rem 1rem 1.35rem;
  }
}

.buzzy-widget-scope .bz-modal-subtitle {
  margin: 0.28rem 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bz-muted);
}


.buzzy-widget-scope .bz-modal-close {
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
    background-color 0.12s ease,
    color 0.12s ease;
}

.buzzy-widget-scope .bz-modal-close-icon {
  display: block;
  flex-shrink: 0;
}

.buzzy-widget-scope .bz-modal-close:hover {
  background: var(--bz-tint);
  color: var(--bz-fg);
}

.buzzy-widget-scope .bz-modal-close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-modal-hint-strip {
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

.buzzy-widget-scope .bz-modal-hint-strip--inside {
  margin-top: 0;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 92%, transparent);
  background: color-mix(in srgb, var(--bz-bg) 78%, var(--bz-panel));
  padding: 0.45rem 1rem calc(0.5rem + env(safe-area-inset-bottom, 0px));
  border-radius: 0;
  font-size: 0.72rem;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-modal-hint-strip--inside {
    padding: 0.5rem 1.25rem calc(0.55rem + env(safe-area-inset-bottom, 0px));
    border-radius: 0 0 calc(var(--bz-r) * 1.35) calc(var(--bz-r) * 1.35);
  }
}

.buzzy-widget-scope .bz-modal-sheet--inline .bz-modal-hint-strip--inside {
  border-radius: 0 0 calc(var(--bz-r) * 1.15) calc(var(--bz-r) * 1.15);
}

.buzzy-widget-scope .bz-modal-hint-strip--below {
  margin: 0 auto;
  max-width: min(36rem, 100%);
  padding: 0.6rem 1rem;
  font-size: 0.72rem;
  line-height: 1.45;
  color: color-mix(in srgb, var(--bz-fg) 72%, var(--bz-muted));
  background: color-mix(in srgb, var(--bz-panel) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--bz-border-soft) 85%, transparent);
  border-radius: calc(var(--bz-r) * 1.15);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-modal-hint-strip--below {
    max-width: min(40rem, calc(100vw - 2.5rem));
  }
}

.buzzy-widget-scope .bz-modal-hint-item {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.buzzy-widget-scope .bz-modal-hint-item-text {
  color: inherit;
}

.buzzy-widget-scope .bz-modal-hint-sep {
  color: var(--bz-border);
  user-select: none;
}

.buzzy-widget-scope .bz-modal-hint-sep--hide-sm {
  display: none;
}

@media (min-width: 400px) {
  .buzzy-widget-scope .bz-modal-hint-sep--hide-sm {
    display: inline;
  }
}

.buzzy-widget-scope .bz-modal-hint-item--wrap {
  flex: 1 1 100%;
  justify-content: center;
  text-align: center;
}

@media (min-width: 520px) {
  .buzzy-widget-scope .bz-modal-hint-item--wrap {
    flex: 0 1 auto;
    text-align: left;
  }
}

.buzzy-widget-scope .bz-modal-hint-short {
  display: inline;
}

.buzzy-widget-scope .bz-modal-hint-long {
  display: none;
}

@media (min-width: 520px) {
  .buzzy-widget-scope .bz-modal-hint-short {
    display: none;
  }

  .buzzy-widget-scope .bz-modal-hint-long {
    display: inline;
  }
}

.buzzy-widget-scope .bz-kbd {
  display: inline-block;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
  padding: 0.2rem 0.45rem;
  border-radius: calc(var(--bz-r) * 0.45);
  border: 1px solid var(--bz-border-soft);
  background: var(--bz-panel);
  color: var(--bz-fg);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--bz-fg) 6%, transparent);
}

.buzzy-widget-scope .bz-modal-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem 1.25rem 1.35rem;
}

/* Grouped label + control — consistent vertical rhythm in composer modals */
.buzzy-widget-scope .bz-modal-body .bz-form-field {
  margin-bottom: 1.1rem;
}

.buzzy-widget-scope .bz-modal-body .bz-form-field:last-child {
  margin-bottom: 0;
}

.buzzy-widget-scope .bz-modal-body .bz-form-field .bz-l {
  display: block;
  margin: 0 0 0.45rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--bz-fg);
  opacity: 0.88;
}

.buzzy-widget-scope .bz-rating-input {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 2.75rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1);
  background: var(--bz-input-bg);
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.buzzy-widget-scope .bz-rating-input:hover {
  border-color: color-mix(in srgb, var(--bz-border) 70%, var(--bz-border-soft));
}

.buzzy-widget-scope .bz-rating-input:focus-within {
  outline: none;
  border-color: color-mix(in srgb, var(--bz-p) 55%, var(--bz-border-soft));
  box-shadow: 0 0 0 3px var(--bz-focus-ring);
}

.buzzy-widget-scope .bz-rating-input .bz-stars {
  gap: 0.06rem;
}

.buzzy-widget-scope .bz-rating-input .bz-star-btn {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.12rem;
  border-radius: 0.5rem;
}

.buzzy-widget-scope .bz-rating-input .bz-star-btn svg {
  width: 1.26rem;
  height: 1.26rem;
}

.buzzy-widget-scope .bz-modal-body .bz-msg {
  margin-bottom: 0.75rem;
}

.buzzy-widget-scope .bz-modal-body .bz-modal-intro {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem 0.75rem 0.95rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--bz-fg);
  font-weight: 500;
  background: color-mix(in srgb, var(--bz-tint) 14%, var(--bz-input-bg));
  border: 1px solid var(--bz-border-soft);
  border-left-width: 3px;
  border-left-color: color-mix(in srgb, var(--bz-p) 52%, var(--bz-border-soft));
  border-radius: calc(var(--bz-r) * 0.95);
}

.buzzy-widget-scope .bz-modal-body .bz-in {
  min-height: 2.75rem;
  padding: 0.65rem 0.9rem;
  font-size: 0.9375rem;
}

.buzzy-widget-scope .bz-modal-body textarea.bz-in {
  min-height: 6.75rem;
}

.buzzy-widget-scope .bz-modal-body .bz-form-field .bz-composer-surface {
  margin-top: 0;
}

.buzzy-widget-scope .bz-modal-body .bz-composer-surface {
  margin-top: 0.5rem;
}

.buzzy-widget-scope .bz-modal-body .bz-tiptap {
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

.buzzy-widget-scope .bz-modal-body--step-in {
  animation: bz-modal-body-step 0.26s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .buzzy-widget-scope .bz-modal-body--step-in {
    animation: none;
  }
}

.buzzy-widget-scope .bz-modal-footer {
  flex-shrink: 0;
  padding: 1rem 1.25rem 1rem;
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 92%, transparent);
  background: color-mix(in srgb, var(--bz-bg) 65%, var(--bz-panel));
  border-radius: 0;
  box-shadow: 0 -6px 20px color-mix(in srgb, var(--bz-fg) 4%, transparent);
}

.buzzy-widget-scope .bz-modal-sheet--inline .bz-modal-footer {
  border-radius: 0;
  box-shadow: none;
}

@media (min-width: 640px) {
  .buzzy-widget-scope .bz-modal-footer {
    border-radius: 0;
    box-shadow: none;
  }
}

.buzzy-widget-scope .bz-modal-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;
}

.buzzy-widget-scope .bz-modal-footer-inner .bz-btn.bz-btn--modal,
.buzzy-widget-scope .bz-modal-footer-inner .bz-btn--secondary.bz-btn--modal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  margin-top: 0;
  min-height: 2.65rem;
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  border-radius: calc(var(--bz-r) * 1.65);
}

.buzzy-widget-scope .bz-modal-footer-inner .bz-btn--modal .bz-ico {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
  opacity: 0.88;
}

.buzzy-widget-scope .bz-modal-footer-inner .bz-btn--modal-primary.bz-btn:not(:disabled) {
  box-shadow: 0 1px 2px color-mix(in srgb, var(--bz-p) 25%, transparent),
    0 2px 8px color-mix(in srgb, var(--bz-p) 18%, transparent);
}

.buzzy-widget-scope .bz-modal-footer-inner .bz-btn--modal-primary.bz-btn:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 2px 4px color-mix(in srgb, var(--bz-p) 28%, transparent),
    0 4px 14px color-mix(in srgb, var(--bz-p) 22%, transparent);
}

.buzzy-widget-scope .bz-modal-footer-inner .bz-btn--secondary.bz-btn--modal {
  background: transparent;
  border-color: transparent;
  color: var(--bz-muted);
  box-shadow: none;
}

.buzzy-widget-scope .bz-modal-footer-inner .bz-btn--secondary.bz-btn--modal:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-tint) 38%, transparent);
  border-color: transparent;
  color: var(--bz-fg);
}

.buzzy-widget-scope .bz-modal-footer-inner .bz-btn,
.buzzy-widget-scope .bz-modal-footer-inner .bz-btn--secondary {
  margin-top: 0;
  flex: 1 1 auto;
  min-width: 7rem;
}

@media (min-width: 480px) {
  .buzzy-widget-scope .bz-modal-footer-inner .bz-btn,
  .buzzy-widget-scope .bz-modal-footer-inner .bz-btn--secondary {
    flex: 0 1 auto;
  }
}
`;
