/** Non-interactive composer stars — preview only. */
import { BzStarGlyph } from "./bz-stars";

export function WidgetComposerStarsStatic({ large, hideLabel }: { large?: boolean; hideLabel?: boolean }) {
  const labelCls = `bz-composer-stars-label${large ? " bz-composer-stars-label--lg" : ""}`.trim();
  const size = large ? "1.5rem" : "1.2rem";
  const stars = (
    <span className="bz-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="bz-star-glyph-wrap">
          <BzStarGlyph style={{ color: "var(--bz-muted)", width: size, height: size }} />
        </span>
      ))}
    </span>
  );
  if (hideLabel) return stars;
  return (
    <div className="bz-composer-stars-row">
      <span className={labelCls}>Your rating</span>
      {stars}
    </div>
  );
}
