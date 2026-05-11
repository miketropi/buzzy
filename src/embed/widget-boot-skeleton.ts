/** Static HTML for the embed Shadow DOM before GET /api/v1/config resolves (matches comment widget chrome). */

const BOOT_THREAD_CARD = `<article class="bz-card bz-thread-card bz-card--surface-flat bz-thread-skeleton-card"><div class="bz-row"><div class="bz-skeleton-avatar bz-skeleton-shimmer"></div><div class="bz-skeleton-text-col"><div class="bz-skeleton-name-line bz-skeleton-shimmer"></div><div class="bz-skeleton-line bz-skeleton-shimmer"></div><div class="bz-skeleton-line bz-skeleton-line--narrow bz-skeleton-shimmer"></div><div class="bz-skeleton-line bz-skeleton-line--medium bz-skeleton-shimmer"></div></div></div></article>`;

export const WIDGET_BOOT_PLACEHOLDER_HTML = `
<div class="bz-main-stack">
  <div class="bz-embed-section">
    <span class="bz-sr-only">Loading widget…</span>
    <div class="bz-boot-skel-title bz-skeleton-shimmer" aria-hidden="true"></div>
    <div class="bz-widget-toolbar">
      <span class="bz-widget-toolbar-count"><span class="bz-skeleton-toolbar-count bz-skeleton-shimmer" aria-hidden="true"></span></span>
      <div class="bz-widget-toolbar-sort">
        <nav class="bz-widget-sort-nav" aria-hidden="true">
          <div class="bz-boot-skel-pill bz-skeleton-shimmer"></div>
          <div class="bz-boot-skel-pill bz-skeleton-shimmer"></div>
          <div class="bz-boot-skel-pill bz-skeleton-shimmer"></div>
        </nav>
      </div>
    </div>
    <div class="bz-thread-entries" aria-busy="true">
      <div class="bz-entry-list-group" aria-hidden="true">
        ${BOOT_THREAD_CARD}
        ${BOOT_THREAD_CARD}
        ${BOOT_THREAD_CARD}
      </div>
    </div>
    <div class="bz-comp--cta" aria-hidden="true">
      <div class="bz-boot-skel-cta bz-skeleton-shimmer"></div>
    </div>
  </div>
</div>
`.trim();
