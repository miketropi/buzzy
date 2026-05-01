/**
 * Shared widget chrome tokens: dashboard preview and embed (buzzy.js) use the same
 * variable block so appearance settings match the live Shadow DOM widget.
 */

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
};

const HOST_FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
  },
  prefersDarkMedia: boolean,
): WidgetChromeTokenInput {
  const theme = typeof cfg.theme === "string" ? cfg.theme : "light";
  const isDark = resolveWidgetChromeDark(theme, prefersDarkMedia);
  return {
    primaryColor: typeof cfg.primary_color === "string" ? cfg.primary_color : "#f5db8d",
    borderRadius: typeof cfg.border_radius === "string" ? cfg.border_radius : "8px",
    fontFamily: cfg.font_family ?? null,
    useHostTypography: Boolean(cfg.use_host_typography),
    isDark,
    submitButtonStyle: normalizeSubmitButtonStyle(cfg.submit_button_style),
    composerTextScale: normalizeComposerTextScale(cfg.composer_text_scale),
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
  };
}

function cssEscapeUrl(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function buildPrimaryButtonOverrideRules(
  scopedRoot: string,
  style: SubmitButtonStyle,
): string {
  if (style === "filled") return "";
  const primary = ".bz-btn:not(.bz-btn--secondary)";
  if (style === "outline") {
    return `${scopedRoot} ${primary} {
  background: transparent !important;
  color: var(--bz-p);
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
  return `${scopedRoot} ${primary} {
  background: color-mix(in srgb, var(--bz-p) 24%, var(--bz-panel)) !important;
  color: var(--bz-fg);
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
  const radius = cssEscapeUrl(p.borderRadius.trim() || "8px");
  const font = p.useHostTypography
    ? "inherit"
    : cssEscapeUrl((p.fontFamily || HOST_FONT_STACK).trim());
  const bg = p.isDark ? "#101210" : "#fafbf9";
  const fg = p.isDark ? "#e8ebe5" : "#111411";
  const muted = p.isDark ? "#8b9288" : "#5a6255";
  const border = p.isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.09)";
  const borderSoft = p.isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const panel = p.isDark ? "#161916" : "#ffffff";
  const inputBg = p.isDark ? "#0d0f0c" : "#fafaf8";
  const tint = primaryColorTint(primary);
  const focusRing = `color-mix(in srgb, ${primary} 48%, transparent)`;

  const btnMod = p.submitButtonStyle;
  const textMod = p.composerTextScale;
  const scopedWithMods = `${selector}.bz-btn-style--${btnMod}.bz-text-scale--${textMod}`;

  const variables = `${selector} {
  --bz-p: ${primary};
  --bz-r: ${radius};
  --bz-bg: ${bg};
  --bz-fg: ${fg};
  --bz-muted: ${muted};
  --bz-border: ${border};
  --bz-border-soft: ${borderSoft};
  --bz-panel: ${panel};
  --bz-input-bg: ${inputBg};
  --bz-btn-fg: #14110a;
  --bz-tint: ${tint};
  --bz-focus-ring: ${focusRing};
  font-family: ${font};
}
`;

  return (
    variables +
    buildTextScaleRules(scopedWithMods, p.composerTextScale) +
    buildPrimaryButtonOverrideRules(scopedWithMods, p.submitButtonStyle)
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
