"use client";

import type { ReactNode } from "react";
import {
  Eye,
  Info,
  LayoutList,
  MousePointer2,
  PenLine,
  Settings2,
  Type,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { contrastingForeground, normalizeHexRgb } from "@/lib/contrast-color";
import { COLOR_PRESETS, type ColorPresetId, presetPrimary } from "@/lib/appearance-presets";
import type { SubmitButtonStyle } from "@/lib/widget-chrome-tokens";
import { WIDGET_MODE_PREVIEW, normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { WidgetAppearancePreview } from "@/components/widget-appearance-preview";

const themes = ["light", "dark", "auto"] as const;

function inferPresetFromPrimary(hex: string): ColorPresetId {
  const norm = hex.trim().toLowerCase();
  for (const p of COLOR_PRESETS) {
    if (p.id !== "custom" && p.primary.toLowerCase() === norm) return p.id;
  }
  return "custom";
}

const submitButtonOptions: {
  value: SubmitButtonStyle;
  label: string;
  description: string;
}[] = [
  { value: "filled", label: "Solid", description: "Primary fill — default" },
  { value: "outline", label: "Outline", description: "Border + transparent fill" },
  { value: "soft", label: "Soft", description: "Tinted, calmer surface" },
];

export function ProjectAppearanceForm({
  projectId,
  previewWidgetMode,
  initialTheme,
  initialPrimaryColor,
  initialColorPreset,
  initialBorderRadius,
  initialFontFamily,
  initialUseHostTypography,
  initialSubmitButtonStyle,
  initialSubmitButtonFgColor,
  initialMutedTextColor,
  slots,
}: {
  projectId: string;
  previewWidgetMode: string;
  initialTheme: string;
  initialPrimaryColor: string;
  initialColorPreset: string;
  initialBorderRadius: string;
  initialFontFamily: string;
  initialUseHostTypography: boolean;
  initialSubmitButtonStyle: string;
  initialSubmitButtonFgColor: string | null;
  initialMutedTextColor: string | null;
  /** Compose options + preview inside a parent layout (e.g. unified settings + sticky preview column). */
  slots?: (parts: { optionsPanel: ReactNode; previewPanel: ReactNode }) => ReactNode;
}) {
  const router = useRouter();
  const [mobileTab, setMobileTab] = useState<"options" | "preview">("options");
  const [theme, setTheme] = useState(initialTheme);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [colorPreset, setColorPreset] = useState<ColorPresetId>(() => {
    const id = initialColorPreset as ColorPresetId;
    return COLOR_PRESETS.some((p) => p.id === id) ? id : inferPresetFromPrimary(initialPrimaryColor);
  });
  const [borderRadius, setBorderRadius] = useState(initialBorderRadius);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [useHostTypography, setUseHostTypography] = useState(initialUseHostTypography);
  const [submitButtonStyle, setSubmitButtonStyle] = useState<SubmitButtonStyle>(() =>
    submitButtonOptions.some((o) => o.value === initialSubmitButtonStyle)
      ? (initialSubmitButtonStyle as SubmitButtonStyle)
      : "filled",
  );
  function coerceStoredHex(input: string | null | undefined): string | null {
    if (!input || typeof input !== "string") return null;
    return normalizeHexRgb(input.trim());
  }
  const [submitButtonFgDraft, setSubmitButtonFgDraft] = useState(() => coerceStoredHex(initialSubmitButtonFgColor) ?? "");
  const [mutedTextDraft, setMutedTextDraft] = useState(() => coerceStoredHex(initialMutedTextColor) ?? "");

  const previewSubmitFgHex = useMemo((): string | null => {
    const t = submitButtonFgDraft.trim();
    if (!t) return null;
    return normalizeHexRgb(t);
  }, [submitButtonFgDraft]);

  const previewMutedHex = useMemo((): string | null => {
    const t = mutedTextDraft.trim();
    if (!t) return null;
    return normalizeHexRgb(t);
  }, [mutedTextDraft]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presetList = useMemo(() => COLOR_PRESETS.filter((p) => p.id !== "custom"), []);
  const suggestedSubmitLabelFg = useMemo(() => contrastingForeground(primaryColor), [primaryColor]);
  const themeDefaultMutedHex = useMemo(
    () => (theme === "dark" ? "#8e8e93" : "#6e6e73"),
    [theme],
  );

  function applyColorPreset(id: ColorPresetId) {
    setColorPreset(id);
    if (id !== "custom") {
      setPrimaryColor(presetPrimary(id));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const trimmedSubmit = submitButtonFgDraft.trim();
      const trimmedMuted = mutedTextDraft.trim();
      const submitNorm = trimmedSubmit === "" ? null : normalizeHexRgb(trimmedSubmit);
      const mutedNorm = trimmedMuted === "" ? null : normalizeHexRgb(trimmedMuted);
      if (trimmedSubmit && !submitNorm) {
        setError('Primary action label: use hex like #f00 or #ff0044, or leave blank for automatic contrast.');
        setLoading(false);
        return;
      }
      if (trimmedMuted && !mutedNorm) {
        setError('Secondary & helper text: use hex like #f00 or #ff0044, or leave blank for the theme default.');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/internal/projects/${projectId}/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          primaryColor,
          colorPreset,
          entryLayout: "list",
          borderRadius,
          fontFamily,
          useHostTypography,
          submitButtonStyle,
          composerTextScale: "md",
          submitButtonFgColor: submitNorm,
          mutedTextColor: mutedNorm,
        }),
      });
      const json = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Could not save appearance.");
        return;
      }
      setMessage("Saved. Widgets pick this up on their next config request.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const optionsPanel = (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          {message}
        </p>
      ) : null}

      <div className="flex gap-3 rounded-lg border border-slate-200/90 bg-slate-50/90 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/50">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-500" strokeWidth={2} />
        <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-sm">
          <strong className="font-medium text-slate-800 dark:text-zinc-200">Widget mode</strong> (behavior column)
          controls comments vs reviews. These options apply to every mode. Embed steps:{" "}
          <span className="font-medium text-slate-800 dark:text-zinc-200">How to use</span>.
        </p>
      </div>

      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-brand" strokeWidth={2} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            Theme &amp; shape
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Light/dark preference, rounded corners, and how the thread reads in the embed.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="theme" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Color mode
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
              Light, dark, or follow the visitor&apos;s system.
            </p>
          </div>
          <div>
            <label htmlFor="borderRadius" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Corner radius
            </label>
            <input
              id="borderRadius"
              value={borderRadius}
              onChange={(e) => setBorderRadius(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
              placeholder="8px"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">Any CSS length (e.g. 8px, 0.5rem).</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-md border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/40">
          <LayoutList className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-500" strokeWidth={2} />
          <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
            <strong className="font-medium text-slate-800 dark:text-zinc-200">Feed layout</strong> is always a
            vertical list — no extra mode to choose.
          </p>
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-brand" strokeWidth={2} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">Accent color</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Stars, links, and primary buttons. Choose a preset or <strong className="font-medium">Custom</strong> for an
          exact brand value.
        </p>
        <div className="flex flex-wrap gap-2">
          {presetList.map((p) => {
            const selected = colorPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyColorPreset(p.id)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-brand/50 bg-brand-muted ring-1 ring-brand/25 dark:bg-brand/10"
                    : "border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-sm border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: p.primary }}
                  aria-hidden
                />
                {p.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => applyColorPreset("custom")}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
              colorPreset === "custom"
                ? "border-brand/50 bg-brand-muted ring-1 ring-brand/25 dark:bg-brand/10"
                : "border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            }`}
          >
            Custom
          </button>
        </div>
        {colorPreset === "custom" ? (
          <div className="max-w-xs">
            <label htmlFor="primaryColor" className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Hex or CSS color
            </label>
            <input
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => {
                setPrimaryColor(e.target.value);
                setColorPreset("custom");
              }}
              className="input-buzzy !mt-0"
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-brand" strokeWidth={2} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">Typography</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Use your site&apos;s fonts so the widget feels native, or set an explicit stack for every embed.
        </p>
        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="fontMode"
              className="mt-1"
              checked={useHostTypography}
              onChange={() => setUseHostTypography(true)}
            />
            <span>
              <span className="block text-sm font-medium text-slate-900 dark:text-white">Match host site (inherit)</span>
              <span className="block text-xs text-slate-500 dark:text-zinc-500">
                Widget text uses the parent page&apos;s font — best when the embed sits inside your themed layout.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="fontMode"
              className="mt-1"
              checked={!useHostTypography}
              onChange={() => setUseHostTypography(false)}
            />
            <span>
              <span className="block text-sm font-medium text-slate-900 dark:text-white">Custom font stack</span>
              <span className="block text-xs text-slate-500 dark:text-zinc-500">
                Same typography on every site that loads the widget.
              </span>
            </span>
          </label>
          {!useHostTypography ? (
            <div className="pl-7">
              <label htmlFor="fontFamily" className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-400">
                CSS font-family
              </label>
              <input
                id="fontFamily"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="input-buzzy !mt-0 font-mono text-sm"
                placeholder='"Your Font", system-ui, sans-serif'
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <MousePointer2 className="h-4 w-4 text-brand" strokeWidth={2} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            Submit button &amp; labels
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Style for Post, Continue, and Submit in the composer. Optional overrides below adjust primary button label and
          muted helper text.
        </p>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600 dark:text-zinc-400">Button style</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {submitButtonOptions.map((opt) => {
              const selected = submitButtonStyle === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSubmitButtonStyle(opt.value)}
                  className={`flex flex-col items-start gap-2 rounded-md border px-3 py-3 text-left transition ${
                    selected
                      ? "border-brand/50 bg-brand-muted ring-1 ring-brand/25 dark:bg-brand/10 dark:ring-brand/35"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="text-xs leading-snug text-slate-500 dark:text-zinc-500">{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/90 bg-white/70 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/30">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
            Fine-tune colors (optional)
          </p>
          <p className="mb-3 text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
            Solid buttons now pick a readable label color from your accent automatically. Use these fields only when you
            need a specific label on primary actions (all three button styles) or a custom tone for secondary / helper
            text across the composer and list.
          </p>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600 dark:text-zinc-400">Primary action label</p>
              {submitButtonFgDraft.trim() ? (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    id="submitButtonFgColorPicker"
                    aria-label="Primary action button label color"
                    value={previewSubmitFgHex ?? suggestedSubmitLabelFg}
                    onChange={(e) => setSubmitButtonFgDraft(normalizeHexRgb(e.target.value) ?? e.target.value)}
                    className="h-9 w-[4.75rem] cursor-pointer overflow-hidden rounded-md border border-slate-300 bg-white p-0 dark:border-zinc-600 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[5px]"
                  />
                  <code className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                    {(previewSubmitFgHex ?? "").toLowerCase() || suggestedSubmitLabelFg}
                  </code>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    onClick={() => setSubmitButtonFgDraft(suggestedSubmitLabelFg)}
                  >
                    Match suggested
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 underline decoration-slate-400/80 underline-offset-2 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                    onClick={() => setSubmitButtonFgDraft("")}
                  >
                    Automatic
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="h-9 w-9 shrink-0 rounded-md border border-slate-300 dark:border-zinc-600"
                    style={{ backgroundColor: suggestedSubmitLabelFg }}
                    aria-hidden
                  />
                  <span className="max-w-[20rem] text-sm text-slate-600 dark:text-zinc-400">
                    Uses automatic contrast for your accent (currently ~{" "}
                    <code className="font-mono text-xs text-slate-800 dark:text-zinc-200">
                      {suggestedSubmitLabelFg}
                    </code>
                    ).
                  </span>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    onClick={() => setSubmitButtonFgDraft(suggestedSubmitLabelFg)}
                  >
                    Choose color…
                  </button>
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600 dark:text-zinc-400">Secondary &amp; helper text</p>
              {mutedTextDraft.trim() ? (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    id="mutedTextColorPicker"
                    aria-label="Secondary and helper text color"
                    value={previewMutedHex ?? themeDefaultMutedHex}
                    onChange={(e) => setMutedTextDraft(normalizeHexRgb(e.target.value) ?? e.target.value)}
                    className="h-9 w-[4.75rem] cursor-pointer overflow-hidden rounded-md border border-slate-300 bg-white p-0 dark:border-zinc-600 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[5px]"
                  />
                  <code className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                    {(previewMutedHex ?? "").toLowerCase() || themeDefaultMutedHex}
                  </code>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    onClick={() => setMutedTextDraft(themeDefaultMutedHex)}
                  >
                    Match theme default
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 underline decoration-slate-400/80 underline-offset-2 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                    onClick={() => setMutedTextDraft("")}
                  >
                    Theme default (auto)
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="h-9 w-9 shrink-0 rounded-md border border-slate-300 dark:border-zinc-600"
                    style={{ backgroundColor: themeDefaultMutedHex }}
                    aria-hidden
                  />
                  <span className="max-w-[20rem] text-sm text-slate-600 dark:text-zinc-400">
                    Uses built‑in muted gray for this appearance (
                    <code className="font-mono text-xs text-slate-800 dark:text-zinc-200">
                      {themeDefaultMutedHex}
                    </code>
                    {theme === "auto" ? " — for “system” themes the widget still picks light vs dark at runtime." : ""}
                    ).
                  </span>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    onClick={() => setMutedTextDraft(themeDefaultMutedHex)}
                  >
                    Choose color…
                  </button>
                </div>
              )}
              <p className="mt-2 text-[0.7rem] leading-snug text-slate-500 dark:text-zinc-500">
                Overrides labels and hints that use muted styling. Automatic uses the preset for your theme mode choice
                above.
              </p>
            </div>
          </div>
        </div>
      </section>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving…" : "Save appearance"}
      </button>
    </form>
  );

  const previewPanel = (
    <WidgetAppearancePreview
      widgetMode={normalizeWidgetMode(previewWidgetMode)}
      theme={theme}
      primaryColor={primaryColor}
      borderRadius={borderRadius}
      fontFamily={fontFamily}
      useHostTypography={useHostTypography}
      submitButtonStyle={submitButtonStyle}
      submitButtonFgColor={previewSubmitFgHex}
      mutedTextColor={previewMutedHex}
    />
  );

  if (slots) {
    return slots({ optionsPanel, previewPanel });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-zinc-700 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">Appearance</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Widget look</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            Colors, type, and chrome for the embed (via <code className="text-xs">/api/v1/config</code>).{" "}
            <strong className="font-medium text-slate-800 dark:text-zinc-200">Options</strong> /{" "}
            <strong className="font-medium text-slate-800 dark:text-zinc-200">Preview</strong> on small screens.
          </p>
        </div>
        
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div
          className={`min-w-0 lg:max-w-xl lg:flex-1 ${mobileTab === "preview" ? "hidden lg:block" : ""}`}
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {optionsPanel}
          </div>
        </div>
        <aside
          className={`min-w-0 lg:flex-1 lg:max-w-[520px] ${mobileTab === "options" ? "hidden lg:block" : ""}`}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
            Live preview
          </p>
          <div className="lg:sticky lg:top-6">{previewPanel}</div>
        </aside>
      </div>
    </div>
  );
}
