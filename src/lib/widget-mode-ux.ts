/**
 * Widget mode semantics for dashboard preview & copy (aligned with `widgetModeSchema`).
 *
 * **comment** — discussion thread; no star rating on compose.
 * **review** — aggregate rating, starred entries, review composer.
 * **rating** — compact average + star-first capture.
 *
 * Legacy DB value `all` is coerced to **`review`** (closest public API behavior: reviews path, comments off).
 */

export type PublicWidgetMode = "comment" | "review" | "rating";

export function normalizeWidgetMode(v: string): PublicWidgetMode {
  if (v === "review" || v === "rating" || v === "comment") return v;
  if (v === "all") return "review";
  return "comment";
}

export const WIDGET_MODE_PREVIEW = {
  comment: {
    label: "Comment",
    headline: "Discussion thread",
    description:
      "Visitors post text replies and nested threads. The compose box does not ask for a star rating — that stays for review-style flows.",
  },
  review: {
    label: "Review",
    headline: "Reviews & average rating",
    description:
      "Shows a rating summary, each entry carries stars, and new posts use a review form (rate + optional text).",
  },
  rating: {
    label: "Rating only",
    headline: "Quick score capture",
    description:
      "Highlights the average and a focused star control. Minimal thread — ideal for compact PDP or banner slots.",
  },
} as const;

export function modeShowsPublicRatingSummary(mode: PublicWidgetMode): boolean {
  return mode === "review" || mode === "rating";
}

export function modeShowsReviewStyleEntries(mode: PublicWidgetMode): boolean {
  return mode === "review" || mode === "rating";
}

export function modeShowsCommentDiscussion(mode: PublicWidgetMode): boolean {
  return mode === "comment";
}

export function modeComposerHasStarRating(mode: PublicWidgetMode): boolean {
  return mode === "review" || mode === "rating";
}
