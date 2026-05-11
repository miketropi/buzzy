/**
 * IntersectionObserver with `root: null` only tracks the browser viewport. When the embed
 * lives inside a scrollable ancestor (common in modals, side panels, or overflow:auto layouts),
 * the sentinel never intersects the viewport while the user scrolls that element — so "load more"
 * never fires. Walk layout parents (including out of shadow roots) to find the nearest
 * vertical scroll container to use as the observer root.
 */
function layoutParent(el: HTMLElement): HTMLElement | null {
  if (el.parentElement) return el.parentElement;
  const root = el.getRootNode();
  if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
    return root.host;
  }
  return null;
}

export function nearestVerticalScrollIntersectionRoot(from: HTMLElement): Element | null {
  if (typeof window === "undefined") return null;
  let el: HTMLElement | null = layoutParent(from);
  for (let i = 0; i < 64 && el; i++) {
    const style = window.getComputedStyle(el);
    const oy = style.overflowY;
    const scrollableY = oy === "auto" || oy === "scroll" || oy === "overlay";
    if (scrollableY && el.scrollHeight > el.clientHeight + 1) {
      return el;
    }
    el = layoutParent(el);
  }
  return null;
}
