/**
 * Accessible-ish foreground picks for colored surfaces (solid primary CTAs).
 * Used by widget chrome so submit buttons stay readable for any accent.
 */

/** Expands "#RGB" to "#RRGGBB"; returns lowercase "#rrggbb" or null. */
export function normalizeHexRgb(input: string | null | undefined): string | null {
  const t = typeof input === "string" ? input.trim() : "";
  if (!t.startsWith("#")) return null;
  const body = t.slice(1);
  if (!/^[0-9a-fA-F]{3}$/.test(body) && !/^[0-9a-fA-F]{6}$/.test(body)) return null;
  let r: string;
  let g: string;
  let b: string;
  if (body.length === 3) {
    r = body[0]! + body[0]!;
    g = body[1]! + body[1]!;
    b = body[2]! + body[2]!;
  } else {
    r = body.slice(0, 2);
    g = body.slice(2, 4);
    b = body.slice(4, 6);
  }
  return `#${r.toLowerCase()}${g.toLowerCase()}${b.toLowerCase()}`;
}

function channelToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance 0–1 (WCAG). */
export function relativeLuminanceFromHex(hex: string): number | null {
  const norm = normalizeHexRgb(hex);
  if (!norm) return null;
  const n = Number.parseInt(norm.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function contrastRatio(lum1: number, lum2: number): number {
  const L1 = Math.max(lum1, lum2);
  const L2 = Math.min(lum1, lum2);
  return (L1 + 0.05) / (L2 + 0.05);
}

/** Choose near-black or near-white for text on a solid `backgroundHex` fill. */
export function contrastingForeground(hex: string): string {
  const lumBg = relativeLuminanceFromHex(hex);
  if (lumBg == null) return "#141414";

  const black = "#111111";
  const white = "#fafafa";
  const lumBlack = relativeLuminanceFromHex(black)!;
  const lumWhite = relativeLuminanceFromHex(white)!;

  const cBlack = contrastRatio(lumBg, lumBlack);
  const cWhite = contrastRatio(lumBg, lumWhite);

  return cBlack >= cWhite ? black : white;
}
