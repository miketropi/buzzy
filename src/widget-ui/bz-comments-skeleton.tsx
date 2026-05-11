/**
 * Placeholder rows while `/api/v1/comments` loads (matches comfortable thread density).
 */
export function BzCommentsThreadSkeleton({
  rows = 3,
}: {
  rows?: number;
}) {
  const count = Number.isFinite(rows) ? Math.min(6, Math.max(1, Math.floor(rows))) : 3;
  return (
    <div className="bz-entry-list-group" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <article
          key={i}
          className="bz-card bz-thread-card bz-card--surface-flat bz-thread-skeleton-card"
        >
          <div className="bz-row">
            <div className="bz-skeleton-avatar bz-skeleton-shimmer" />
            <div className="bz-skeleton-text-col">
              <div className="bz-skeleton-name-line bz-skeleton-shimmer" />
              <div className="bz-skeleton-line bz-skeleton-shimmer" />
              <div className="bz-skeleton-line bz-skeleton-line--narrow bz-skeleton-shimmer" />
              <div className="bz-skeleton-line bz-skeleton-line--medium bz-skeleton-shimmer" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
