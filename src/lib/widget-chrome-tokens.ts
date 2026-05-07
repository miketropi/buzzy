/**
 * Shared widget chrome tokens: dashboard preview and embed (buzzy.js) use the same
 * variable block so appearance settings match the live Shadow DOM widget.
 */

import { contrastingForeground, normalizeHexRgb } from "@/lib/contrast-color";

export type SubmitButtonStyle = "filled" | "outline" | "soft";
export type ComposerTextScale = "sm" | "md" | "lg";

export type WidgetChromeTokenInput = {
  primaryColor: string;
  borderRadius: string;
  fontFamily: string | null;
  useHostTypography: boolean;
  isDark: boolean;
  submitButtonStyle: SubmitButtonStyle;
  composerTextScale: ComposerTextScale;
  /** Custom label color on primary CTA (.bz-btn:not(.bz-btn--secondary)); null → auto contrast on filled / style defaults elsewhere. */
  submitButtonFgColor: string | null;
  /** Custom secondary/muted copy color; null → theme default. */
  mutedTextColor: string | null;
};

/** Apple-first stack so buzzy.js reads native on iOS/macOS Safari. */
const HOST_FONT_STACK =
  '"SF Pro Text", "SF Pro Display", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function resolveWidgetChromeDark(theme: string, prefersDarkMedia: boolean): boolean {
  if (theme === "dark") return true;
  if (theme === "auto" && prefersDarkMedia) return true;
  return false;
}

export function primaryColorTint(hex: string): string {
  const t = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(t)) return `${t}35`;
  return "rgba(245,219,141,0.2)";
}

function normalizeSubmitButtonStyle(v: string | undefined): SubmitButtonStyle {
  return v === "outline" || v === "soft" ? v : "filled";
}

function normalizeComposerTextScale(v: string | undefined): ComposerTextScale {
  return v === "sm" || v === "lg" ? v : "md";
}

function parseOptionalFg(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return normalizeHexRgb(v.trim());
}

/** Map API config (GET /api/v1/config `data`) to token input. */
export function widgetConfigToTokenInput(
  cfg: {
    theme?: string;
    primary_color?: string;
    border_radius?: string;
    font_family?: string | null;
    use_host_typography?: boolean;
    submit_button_style?: string;
    composer_text_scale?: string;
    submit_button_fg_color?: string | null;
    muted_text_color?: string | null;
  },
  prefersDarkMedia: boolean,
): WidgetChromeTokenInput {
  const theme = typeof cfg.theme === "string" ? cfg.theme : "light";
  const isDark = resolveWidgetChromeDark(theme, prefersDarkMedia);
  return {
    primaryColor: typeof cfg.primary_color === "string" ? cfg.primary_color : "#f5db8d",
    borderRadius: typeof cfg.border_radius === "string" ? cfg.border_radius : "11px",
    fontFamily: cfg.font_family ?? null,
    useHostTypography: Boolean(cfg.use_host_typography),
    isDark,
    submitButtonStyle: normalizeSubmitButtonStyle(cfg.submit_button_style),
    composerTextScale: normalizeComposerTextScale(cfg.composer_text_scale),
    submitButtonFgColor:
      cfg.submit_button_fg_color != null ? parseOptionalFg(cfg.submit_button_fg_color) : null,
    mutedTextColor: cfg.muted_text_color != null ? parseOptionalFg(cfg.muted_text_color) : null,
  };
}

export function dashboardToTokenInput(
  theme: string,
  primaryColor: string,
  borderRadius: string,
  fontFamily: string,
  useHostTypography: boolean,
  prefersDarkMedia: boolean,
  submitButtonStyle: SubmitButtonStyle = "filled",
  composerTextScale: ComposerTextScale = "md",
  submitButtonFgColor: string | null = null,
  mutedTextColor: string | null = null,
): WidgetChromeTokenInput {
  const isDark = resolveWidgetChromeDark(theme, prefersDarkMedia);
  return {
    primaryColor,
    borderRadius,
    fontFamily: useHostTypography ? null : fontFamily,
    useHostTypography,
    isDark,
    submitButtonStyle: normalizeSubmitButtonStyle(submitButtonStyle),
    composerTextScale: normalizeComposerTextScale(composerTextScale),
    submitButtonFgColor:
      typeof submitButtonFgColor === "string" ? normalizeHexRgb(submitButtonFgColor.trim()) : null,
    mutedTextColor: typeof mutedTextColor === "string" ? normalizeHexRgb(mutedTextColor.trim()) : null,
  };
}

function cssEscapeUrl(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function buildPrimaryButtonOverrideRules(
  scopedRoot: string,
  style: SubmitButtonStyle,
  submitFgCustomLiteral: string | null,
): string {
  if (style === "filled") return "";
  const primary = ".bz-btn:not(.bz-btn--secondary)";
  const colorLine =
    submitFgCustomLiteral != null ? `color: ${submitFgCustomLiteral} !important;` : null;
  if (style === "outline") {
    const colorDecl = colorLine ?? "color: var(--bz-p);";
    return `${scopedRoot} ${primary} {
  background: transparent !important;
  ${colorDecl}
  border: 1.5px solid var(--bz-p);
  box-shadow: none !important;
  filter: none;
}
${scopedRoot} ${primary}:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-p) 14%, transparent) !important;
  filter: none;
}
`;
  }
  /* soft */
  const colorDecl = colorLine ?? "color: var(--bz-fg);";
  return `${scopedRoot} ${primary} {
  background: color-mix(in srgb, var(--bz-p) 24%, var(--bz-panel)) !important;
  ${colorDecl}
  border: 1px solid color-mix(in srgb, var(--bz-p) 38%, var(--bz-border));
  box-shadow: none !important;
  filter: none;
}
${scopedRoot} ${primary}:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bz-p) 34%, var(--bz-panel)) !important;
  filter: none;
}
`;
}

function buildTextScaleRules(scopedRoot: string, scale: ComposerTextScale): string {
  const fs = scale === "sm" ? "14px" : scale === "lg" ? "16px" : "15px";
  return `${scopedRoot} {
  font-size: ${fs};
}
`;
}

/**
 * CSS rules setting variables on the widget root (`.bz` in shadow, or `.buzzy-widget-scope .bz` in dashboard).
 * @param selector — e.g. `.bz` or `.buzzy-widget-scope .bz` (element that receives size + modifier classes)
 */
export function buildWidgetChromeTokenBlock(selector: string, p: WidgetChromeTokenInput): string {
  const primary = cssEscapeUrl(p.primaryColor.trim() || "#f5db8d");
  const radius = cssEscapeUrl(p.borderRadius.trim() || "11px");
  const font = p.useHostTypography
    ? "inherit"
    : cssEscapeUrl((p.fontFamily || HOST_FONT_STACK).trim());
  /* Semantic neutrals tuned like iOS system grouped backgrounds & separators */
  const bg = p.isDark ? "#1c1c1e" : "#f2f2f7";
  const fg = p.isDark ? "#f2f2f7" : "#1d1d1f";
  const mutedDefault = p.isDark ? "#8e8e93" : "#6e6e73";
  const muted = p.mutedTextColor != null ? p.mutedTextColor : mutedDefault;
  const mutedCss = cssEscapeUrl(muted);
  const border = p.isDark ? "rgba(255,255,255,0.22)" : "rgba(60,60,67,0.29)";
  const borderSoft = p.isDark ? "rgba(255,255,255,0.08)" : "rgba(60,60,67,0.14)";
  const panel = p.isDark ? "#2c2c2e" : "#ffffff";
  const inputBg = p.isDark ? "#2c2c2e" : "#ffffff";
  const tint = primaryColorTint(primary);
  const focusRing = `color-mix(in srgb, ${primary} 48%, transparent)`;
  const autoBtnFg = cssEscapeUrl(contrastingForeground(p.primaryColor));
  const customBtnFg = p.submitButtonFgColor != null ? cssEscapeUrl(p.submitButtonFgColor) : null;
  const literalBtnFg = customBtnFg ?? autoBtnFg;
  const literalBtnFgForOutlineSoft = customBtnFg;

  /** Hairline + float shadows (theme-aware; structural CSS composes layers). */
  const elevOutline =
    "0 0 0 0.5px color-mix(in srgb, var(--bz-border-soft) 76%, transparent)";
  const elevFloat = p.isDark
    ? "0 8px 32px rgba(0,0,0,0.48)"
    : "0 4px 18px color-mix(in srgb, var(--bz-fg) 3.4%, transparent)";
  const elevFloatSm = p.isDark
    ? "0 3px 16px rgba(0,0,0,0.34)"
    : "0 2px 10px color-mix(in srgb, var(--bz-fg) 2.5%, transparent)";

  const btnMod = p.submitButtonStyle;
  const textMod = p.composerTextScale;
  const scopedWithMods = `${selector}.bz-btn-style--${btnMod}.bz-text-scale--${textMod}`;

  const variables = `${selector} {
  --bz-p: ${primary};
  --bz-r: ${radius};
  --bz-shell-r: clamp(14px, calc(var(--bz-r) * 1.75), 26px);
  --bz-control-r: clamp(10px, calc(var(--bz-r) * 1.2), 17px);
  --bz-card-r: clamp(12px, calc(var(--bz-r) * 1.28), 20px);
  --bz-sheet-r-m: clamp(14px, calc(var(--bz-r) * 1.5), 22px);
  --bz-ios-separator: color-mix(in srgb, var(--bz-border) 30%, transparent);
  --bz-elev-outline: ${elevOutline};
  --bz-elev-float: ${elevFloat};
  --bz-elev-float-sm: ${elevFloatSm};
  --bz-bg: ${bg};
  --bz-fg: ${fg};
  --bz-muted: ${mutedCss};
  --bz-border: ${border};
  --bz-border-soft: ${borderSoft};
  --bz-panel: ${panel};
  --bz-input-bg: ${inputBg};
  --bz-btn-fg: ${literalBtnFg};
  --bz-tint: ${tint};
  --bz-focus-ring: ${focusRing};
  --bz-ring: ${focusRing};
  --bz-link: ${primary};
  font-family: ${font};
}
`;

  return (
    variables +
    buildTextScaleRules(scopedWithMods, p.composerTextScale) +
    buildPrimaryButtonOverrideRules(scopedWithMods, p.submitButtonStyle, literalBtnFgForOutlineSoft)
  );
}

/** Shadow DOM: host reset + token block + structural CSS. */
export function buildShadowWidgetStylesheet(
  tokenBlockSelector: string,
  p: WidgetChromeTokenInput,
  structuralCss: string,
): string {
  return (
    `:host { display: block; }
:host * { box-sizing: border-box; }
` +
    buildWidgetChromeTokenBlock(tokenBlockSelector, p) +
    "\n" +
    structuralCss
  );
}

/** Light DOM dashboard preview: scope reset + tokens + structural (scoped). */
export function buildScopedWidgetStylesheet(
  tokenBlockSelector: string,
  p: WidgetChromeTokenInput,
  structuralCssScoped: string,
): string {
  return (
    `.buzzy-widget-scope { display: block; }
.buzzy-widget-scope * { box-sizing: border-box; }
` +
    buildWidgetChromeTokenBlock(tokenBlockSelector, p) +
    "\n" +
    structuralCssScoped
  );
}
