import{a as O,b as y,c as D,d as j,e as m,f as v,g as w,j as k,k as T}from"./buzzy/embed-V4FTFTH6.js";var _=O(g=>{"use strict";var S=j();g.createRoot=S.createRoot,g.hydrateRoot=S.hydrateRoot;var de});var f=y(D()),U=y(_());var E=`/**
 * Widget chrome \u2014 structural rules only. Theme comes from CSS variables set on \`.bz\`.
 * \`\` is replaced at build time: "" for Shadow DOM, ".buzzy-widget-scope " for dashboard preview.
 */

.bz,
.bz * {
  box-sizing: border-box;
}

.bz {
  font-size: 15px;
  line-height: 1.5;
  color: var(--bz-fg);
  background: var(--bz-bg);
  border-radius: calc(var(--bz-r) * 1.2);
  border: none;
  box-shadow: none;
  padding: 1.25rem 1.35rem;
}

/* Section titles \u2014 comments, reviews, ratings */
.bz-head {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.02em;
  color: var(--bz-fg);
  margin: 0 0 0.65rem;
  opacity: 0.92;
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
  border-radius: calc(var(--bz-r) * 1.25);
  box-shadow: none;
  padding: 1.35rem 1.4rem;
  margin-bottom: 0;
}

.bz-panel--sm {
  padding: 1.1rem 1.25rem;
}

.bz-card {
  background: var(--bz-input-bg);
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1.2);
  box-shadow: none;
  padding: 1.05rem 1.15rem;
  margin-bottom: 0;
}

/* Comment / review thread entry cards */
.bz-thread-card {
  padding: 1rem 1.05rem;
  border-radius: calc(var(--bz-r) * 1.35);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

@media (hover: hover) and (pointer: fine) {
  .bz-thread-card:hover {
    border-color: color-mix(in srgb, var(--bz-border) 55%, var(--bz-border-soft));
    box-shadow: 0 1px 0 color-mix(in srgb, var(--bz-fg) 4%, transparent);
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
  font-weight: 500;
  letter-spacing: -0.01em;
}

.bz-entry-meta::before {
  content: "\xB7";
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
  border-radius: 999px;
  background: color-mix(in srgb, var(--bz-tint) 35%, transparent);
}

.bz-helpful {
  color: var(--bz-muted);
}

.bz-replies {
  margin-top: 0.85rem;
  padding: 0.65rem 0 0.15rem 0.95rem;
  margin-left: 0.15rem;
  border-left: 3px solid color-mix(in srgb, var(--bz-p) 22%, var(--bz-border-soft));
  border-radius: 0 calc(var(--bz-r) * 0.85) calc(var(--bz-r) * 0.85) 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.bz-replies .bz-thread-card {
  padding: 0.85rem 0.95rem;
  background: color-mix(in srgb, var(--bz-panel) 22%, var(--bz-input-bg));
  border-color: color-mix(in srgb, var(--bz-border-soft) 92%, var(--bz-border));
  border-radius: calc(var(--bz-r) * 1.05);
}

@media (min-width: 640px) {
  .bz-replies {
    padding-left: 1.1rem;
    margin-left: 0.2rem;
    gap: 0.75rem;
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
  padding: 0.3rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--bz-muted);
  background: var(--bz-panel);
  border-radius: 999px;
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
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1);
  background: var(--bz-input-bg);
  color: var(--bz-fg);
  font: inherit;
  box-shadow: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
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

.bz-btn--secondary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-tint) 45%, var(--bz-panel));
  border-color: color-mix(in srgb, var(--bz-border) 80%, var(--bz-border-soft));
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

/* Legacy \u2014 kept for older embed markup */
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

@media (min-width: 640px) {
  .bz-list {
    gap: 1rem;
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
  border-radius: calc(var(--bz-r) * 0.95);
  border: 1px solid var(--bz-border-soft);
  background: var(--bz-tint);
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

/* Layout helpers \u2014 use inside .bz / Shadow DOM (no host Tailwind). */

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
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .bz-main-stack {
    gap: 1.65rem;
  }
}

.bz-thread-entries {
  margin-top: 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

@media (min-width: 640px) {
  .bz-thread-entries {
    gap: 0.95rem;
  }
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
  color: var(--bz-p);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.bz-prose ul,
.bz-prose ol {
  margin: 0.35rem 0;
  padding-left: 1.25rem;
}

.bz-prose blockquote {
  margin: 0.5rem 0;
  padding: 0.35rem 0.75rem;
  border-left: 3px solid var(--bz-p);
  background: var(--bz-tint);
  border-radius: calc(var(--bz-r) * 0.5);
}

.bz-prose code {
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  border-radius: calc(var(--bz-r) * 0.4);
  background: var(--bz-tint);
}

.bz-prose pre {
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  overflow-x: auto;
  border-radius: calc(var(--bz-r) * 0.6);
  background: var(--bz-tint);
  font-size: 0.85rem;
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
  border-radius: calc(var(--bz-r) * 1.15);
  background: var(--bz-input-bg);
  border: 1px solid var(--bz-border-soft);
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
  color: var(--bz-p);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  font-weight: 500;
  border-radius: 0.25em;
  transition: color 0.12s ease;
}

.bz-link:hover:not(:disabled) {
  color: color-mix(in srgb, var(--bz-p) 85%, var(--bz-fg));
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
  border-top: 1px solid color-mix(in srgb, var(--bz-border-soft) 88%, transparent);
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

/* Composer modal (multi-step comment / review) */

.bz-comp--cta {
  margin-top: 1.35rem;
  padding-top: 1.35rem;
  border-top: 1px solid var(--bz-border-soft);
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
    opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.bz-modal-root--in .bz-modal-column--overlay {
  opacity: 1;
  transform: translateY(0);
}

.bz-modal-root--out .bz-modal-column--overlay {
  opacity: 0;
  transform: translateY(10px);
  transition-duration: 0.22s;
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
  background: rgba(15, 23, 42, 0.42);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.22s ease-out;
}

.bz-modal-root--in .bz-modal-backdrop {
  opacity: 1;
}

.bz-modal-root--out .bz-modal-backdrop {
  opacity: 0;
  transition-duration: 0.2s;
}

.bz-modal-sheet {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(36rem, 100%);
  display: flex;
  flex-direction: column;
  background: var(--bz-bg);
  color: var(--bz-fg);
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1.35) calc(var(--bz-r) * 1.35) 0 0;
  box-shadow: none;
}

.bz-modal-sheet:not(.bz-modal-sheet--inline) {
  max-height: none;
}

@media (min-width: 640px) {
  .bz-modal-sheet {
    max-width: min(40rem, calc(100vw - 2.5rem));
    border-radius: calc(var(--bz-r) * 1.35);
  }
}

.bz-modal-sheet--inline {
  max-height: none;
  margin-top: 1.1rem;
  border-radius: calc(var(--bz-r) * 1.15);
  background: var(--bz-input-bg);
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.15rem 1.25rem 0.75rem;
  flex-shrink: 0;
}

.bz-modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

@media (min-width: 640px) {
  .bz-modal-title {
    font-size: 1.35rem;
  }
}

.bz-modal-close {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -0.25rem -0.25rem 0 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--bz-muted);
  font: inherit;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    color 0.12s ease;
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

.bz-modal-hint-strip--below {
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

.bz-kbd {
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

.bz-modal-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem 0.4rem;
  flex-shrink: 0;
}

.bz-modal-progress-head {
  width: 100%;
  display: flex;
  justify-content: center;
}

.bz-modal-progress-count {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: none;
  color: var(--bz-muted);
}

.bz-modal-progress-track {
  display: flex;
  width: 100%;
  max-width: 12rem;
  gap: 0.22rem;
  align-items: stretch;
}

.bz-modal-progress-seg {
  flex: 1;
  height: 0.14rem;
  border-radius: 999px;
  background: var(--bz-border-soft);
}

.bz-modal-progress-seg--done {
  background: color-mix(in srgb, var(--bz-muted) 40%, var(--bz-border-soft));
}

.bz-modal-progress-seg--current {
  background: color-mix(in srgb, var(--bz-fg) 35%, var(--bz-muted));
}

.bz-modal-step-label {
  margin: 0;
  padding: 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--bz-muted);
  text-align: center;
  line-height: 1.35;
}

.bz-modal-body {
  flex: none;
  min-height: 0;
  overflow: visible;
  padding: 1rem 1.25rem 1.45rem;
}

/* Grouped label + control \u2014 consistent vertical rhythm in composer modals */
.bz-modal-body .bz-form-field {
  margin-bottom: 1.1rem;
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
  border-radius: calc(var(--bz-r) * 1);
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
  border-radius: 0.5rem;
}

.bz-rating-input .bz-star-btn svg {
  width: 1.26rem;
  height: 1.26rem;
}

.bz-modal-body .bz-msg {
  margin-bottom: 0.75rem;
}

.bz-modal-body .bz-modal-intro {
  margin: 0 0 1rem;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--bz-fg);
  font-weight: 500;
  background: linear-gradient(135deg, color-mix(in srgb, var(--bz-tint) 28%, var(--bz-input-bg)) 0%, var(--bz-input-bg) 100%);
  border: 1px solid var(--bz-border-soft);
  border-radius: calc(var(--bz-r) * 1);
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
  animation: bz-modal-body-step 0.26s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .bz-modal-body--step-in {
    animation: none;
  }
}

.bz-modal-footer {
  flex-shrink: 0;
  padding: 1.1rem 1.25rem calc(1.1rem + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--bz-border-soft);
  background: color-mix(in srgb, var(--bz-panel) 88%, transparent);
  border-radius: 0 0 calc(var(--bz-r) * 1.25) calc(var(--bz-r) * 1.25);
  box-shadow: none;
}

.bz-modal-sheet--inline .bz-modal-footer {
  border-radius: 0 0 calc(var(--bz-r) * 1.15) calc(var(--bz-r) * 1.15);
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
  min-height: 2.65rem;
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  border-radius: calc(var(--bz-r) * 1.65);
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
`;var W='system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';function q(r,e){return!!(r==="dark"||r==="auto"&&e)}function N(r){let e=r.trim();return/^#[0-9a-fA-F]{6}$/.test(e)?`${e}35`:"rgba(245,219,141,0.2)"}function F(r){return r==="outline"||r==="soft"?r:"filled"}function Y(r){return r==="sm"||r==="lg"?r:"md"}function B(r,e){var n;let t=typeof r.theme=="string"?r.theme:"light",o=q(t,e);return{primaryColor:typeof r.primary_color=="string"?r.primary_color:"#f5db8d",borderRadius:typeof r.border_radius=="string"?r.border_radius:"8px",fontFamily:(n=r.font_family)!=null?n:null,useHostTypography:!!r.use_host_typography,isDark:o,submitButtonStyle:F(r.submit_button_style),composerTextScale:Y(r.composer_text_scale)}}function z(r){return r.replace(/\\/g,"\\\\").replace(/`/g,"\\`")}function G(r,e){if(e==="filled")return"";let t=".bz-btn:not(.bz-btn--secondary)";return e==="outline"?`${r} ${t} {
  background: transparent !important;
  color: var(--bz-p);
  border: 1.5px solid var(--bz-p);
  box-shadow: none !important;
  filter: none;
}
${r} ${t}:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-p) 14%, transparent) !important;
  filter: none;
}
`:`${r} ${t} {
  background: color-mix(in srgb, var(--bz-p) 24%, var(--bz-panel)) !important;
  color: var(--bz-fg);
  border: 1px solid color-mix(in srgb, var(--bz-p) 38%, var(--bz-border));
  box-shadow: none !important;
  filter: none;
}
${r} ${t}:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-p) 34%, var(--bz-panel)) !important;
  filter: none;
}
`}function V(r,e){return`${r} {
  font-size: ${e==="sm"?"14px":e==="lg"?"16px":"15px"};
}
`}function J(r,e){let t=z(e.primaryColor.trim()||"#f5db8d"),o=z(e.borderRadius.trim()||"8px"),n=e.useHostTypography?"inherit":z((e.fontFamily||W).trim()),i=e.isDark?"#101210":"#fafbf9",a=e.isDark?"#e8ebe5":"#111411",s=e.isDark?"#8b9288":"#5a6255",l=e.isDark?"rgba(255,255,255,0.1)":"rgba(15,23,42,0.09)",b=e.isDark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.06)",d=e.isDark?"#161916":"#ffffff",P=e.isDark?"#0d0f0c":"#fafaf8",I=N(t),L=`color-mix(in srgb, ${t} 48%, transparent)`,M=e.submitButtonStyle,H=e.composerTextScale,x=`${r}.bz-btn-style--${M}.bz-text-scale--${H}`;return`${r} {
  --bz-p: ${t};
  --bz-r: ${o};
  --bz-bg: ${i};
  --bz-fg: ${a};
  --bz-muted: ${s};
  --bz-border: ${l};
  --bz-border-soft: ${b};
  --bz-panel: ${d};
  --bz-input-bg: ${P};
  --bz-btn-fg: #14110a;
  --bz-tint: ${I};
  --bz-focus-ring: ${L};
  font-family: ${n};
}
`+V(x,e.composerTextScale)+G(x,e.submitButtonStyle)}function C(r,e,t){return`:host { display: block; }
:host * { box-sizing: border-box; }
`+J(r,e)+`
`+t}var c={},K="0.1.0";function Q(){try{if(typeof c!="undefined"&&c.url&&!c.url.startsWith("blob:"))return new URL(c.url).origin}catch(t){}let r=typeof document!="undefined"?document:void 0,e=r!=null&&r.currentScript&&"src"in r.currentScript?r.currentScript.src:"";if(!e)return"";try{return new URL(e).origin}catch(t){return""}}var p=v;function X(){return typeof globalThis.matchMedia=="function"&&globalThis.matchMedia("(prefers-color-scheme: dark)").matches}function Z(r,e){var i;let t=B({theme:e.theme,primary_color:e.primary_color,border_radius:e.border_radius,font_family:(i=e.font_family)!=null?i:null,use_host_typography:e.use_host_typography,submit_button_style:e.submit_button_style,composer_text_scale:e.composer_text_scale},X()),o=document.createElement("style");o.textContent=C(".bz",t,E);let n=document.createElement("div");return n.className=`bz bz-btn-style--${t.submitButtonStyle} bz-text-scale--${t.composerTextScale}`,r.appendChild(o),r.appendChild(n),n}function A(r){let e=r.getAttribute("data-user-name"),t=r.getAttribute("data-user-email"),o={};if(e!=null){let n=e.trim();n&&(o.name=n)}if(t!=null){let n=t.trim();n&&(o.email=n)}return o}function ee(r,e){let t={...r};if(e){if(e.name!==void 0){let o=e.name.trim();o?t.name=o:delete t.name}if(e.email!==void 0){let o=e.email.trim();o?t.email=o:delete t.email}}return t.name||t.email?t:null}function re(r){r!=null&&r.trim()?m(r.trim()):m(null)}function te(r,e){let t=A(r),o=ee(t,e);k(o)}function $(r,e){(0,U.createRoot)(r).render(e)}async function oe(r,e,t){let{EmbedCommentsApp:o}=await import("./buzzy/embed-ASCX3FXO.js");$(r,(0,f.createElement)(o,{ctx:e,cfg:t}))}async function ne(r,e,t,o){let{EmbedReviewsApp:n}=await import("./buzzy/embed-ZT3SR5WL.js");$(r,(0,f.createElement)(n,{ctx:e,cfg:t,ratingOnly:o}))}function h(r,e){if(r.dataset.buzzyMounted==="1")return;r.dataset.buzzyMounted="1",te(r,e.userProfile),re(e.hostIdentity);let t=r.attachShadow({mode:"open"}),o=document.createElement("div");o.className="bz",o.style.padding="1rem",o.textContent="Loading\u2026",t.appendChild(o);let n=p(e.apiBase||"");n||(n=Q()||globalThis.location.origin);let i=n+"/api/v1/config?key="+encodeURIComponent(e.key);w(i).then(async a=>{let s=a.data||{};t.removeChild(o);let l=Z(t,s),b=e.modeOverride||s.widget_mode||"comment";b!=="comment"&&b!=="review"&&b!=="rating"&&(b="comment");let d={...e,apiBase:n};b==="comment"?await oe(l,d,s):await ne(l,d,s,b==="rating")}).catch(a=>{t.innerHTML="";let s=document.createElement("div");s.style.cssText="padding:1rem;font-family:system-ui,sans-serif;",s.textContent="Buzzy: "+(a.message||String(a)),t.appendChild(s)})}function ie(r=document){var t,o,n;let e=r.querySelectorAll("[data-buzzy-host]");for(let i=0;i<e.length;i++){let a=e[i];if(a.dataset.buzzyMounted==="1")continue;let s=a.getAttribute("data-key");if(!s){console.warn("Buzzy.scan: data-key is required on [data-buzzy-host]",a);continue}let l=(t=a.getAttribute("data-page-url"))==null?void 0:t.trim();if(!l){console.warn("Buzzy.scan: data-page-url is required on [data-buzzy-host] \u2014 set it to this screen's logical id (https URL, path, slug, or internal id).",a);continue}h(a,{key:s,apiBase:p(a.getAttribute("data-api-base")||""),pageUrl:l,pageTitle:((o=a.getAttribute("data-page-title"))==null?void 0:o.trim())||document.title,modeOverride:a.getAttribute("data-mode"),hostIdentity:((n=a.getAttribute("data-host-identity"))==null?void 0:n.trim())||null})}}function ae(r){var i,a,s,l;let e=r||{};if(!e.key)throw new Error("Buzzy.init: key is required");if(!e.target)throw new Error("Buzzy.init: target is required");let t=typeof e.pageUrl=="string"?e.pageUrl.trim():"";if(!t)throw new Error("Buzzy.init: pageUrl is required. Use the logical id for this screen (e.g. https://shop.com/p/1, /products/handle, a CMS slug, or an internal id your app uses consistently).");let o=typeof e.target=="string"?document.querySelector(e.target):e.target;if(!o||!(o instanceof HTMLElement))throw new Error("Buzzy.init: target element not found");let n=(a=(i=e.hostIdentity)!=null?i:e.ssoAssertion)!=null?a:null;h(o,{key:e.key,apiBase:p(e.apiBase||e.api_base||""),pageUrl:t,pageTitle:e.pageTitle!=null?e.pageTitle:document.title,modeOverride:(s=e.mode)!=null?s:null,userProfile:(l=e.profile)!=null?l:e.user,hostIdentity:n})}function R(){var e,t,o;let r=document.getElementsByTagName("script");for(let n=0;n<r.length;n++){let i=r[n];if(!i.src||!/buzzy\.js(\?|#|$)/i.test(i.src))continue;let a=i.getAttribute("data-key"),s=i.getAttribute("data-target"),l=(e=i.getAttribute("data-page-url"))==null?void 0:e.trim();if(!(!a||!s)){if(!l){console.warn("Buzzy: skipping script \u2014 data-page-url is required (logical page id for this embed: https URL, path, slug, or id). Add data-page-url to your Buzzy script tag.");continue}try{let b=document.querySelector(s);if(b instanceof HTMLElement){let d=A(i);h(b,{key:a,apiBase:p(i.getAttribute("data-api-base")||""),pageUrl:l,pageTitle:((t=i.getAttribute("data-page-title"))==null?void 0:t.trim())||document.title,modeOverride:i.getAttribute("data-mode"),userProfile:d.name||d.email?d:void 0,hostIdentity:((o=i.getAttribute("data-host-identity"))==null?void 0:o.trim())||null})}}catch(b){console.warn("Buzzy auto-init:",b)}}}}function se(r){T(r)}function le(r){m(r)}var u=globalThis;u.Buzzy={version:K,init:ae,scan:ie,setProfile:se,setHostIdentity:le};if(typeof document!="undefined"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R(),typeof u.BuzzyReady=="function"))try{u.BuzzyReady()}catch(r){console.error(r)}
