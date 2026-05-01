import type { CSSProperties, ReactNode } from "react";

/** Soft 24×24 star (rounded silhouette, no sharp Unicode glyph). */
export function BzStarGlyph({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={style}
      focusable="false"
    >
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.636.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

export function WidgetStaticStars({ filled, scale = 5 }: { filled: number; scale?: number }) {
  return (
    <span className="bz-stars bz-star-row-inline" aria-hidden>
      {Array.from({ length: scale }, (_, i) => (
        <span key={i} className="bz-star-glyph-wrap">
          <BzStarGlyph
            style={{
              color: i < filled ? "var(--bz-p)" : "var(--bz-muted)",
            }}
          />
        </span>
      ))}
    </span>
  );
}

export function WidgetInteractiveStars({
  scale,
  value,
  onChange,
}: {
  scale: number;
  value: number;
  onChange: (rating: number) => void;
}): ReactNode {
  return (
    <span className="bz-stars" role="group" aria-label="Star rating">
      {Array.from({ length: scale }, (_, i) => {
        const r = i + 1;
        return (
          <button
            key={r}
            type="button"
            className={`bz-star-btn${r <= value ? " bz-sel" : ""}`}
            aria-pressed={r <= value}
            aria-label={`Rate ${r} of ${scale}`}
            onClick={() => onChange(r)}
          >
            <BzStarGlyph />
          </button>
        );
      })}
    </span>
  );
}
