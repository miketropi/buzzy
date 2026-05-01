"use client";

import type { ReactNode } from "react";
import {
  Eye,
  GalleryHorizontal,
  Info,
  LayoutGrid,
  LayoutList,
  MousePointer2,
  PenLine,
  Settings2,
  Type,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { COLOR_PRESETS, ENTRY_LAYOUTS, type ColorPresetId, presetPrimary } from "@/lib/appearance-presets";
import type { ComposerTextScale, SubmitButtonStyle } from "@/lib/widget-chrome-tokens";
import { WIDGET_MODE_PREVIEW, normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { WidgetAppearancePreview } from "@/components/widget-appearance-preview";

const themes = ["light", "dark", "auto"] as const;

const layoutIcons = {
  list: LayoutList,
  card_grid: LayoutGrid,
  carousel: GalleryHorizontal,
} as const;

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

const composerTextOptions: {
  value: ComposerTextScale;
  label: string;
  description: string;
}[] = [
  { value: "sm", label: "Compact", description: "Smaller labels and fields" },
  { value: "md", label: "Standard", description: "Balanced default" },
  { value: "lg", label: "Comfort", description: "Larger body text" },
];

export function ProjectAppearanceForm({
  projectId,
  previewWidgetMode,
  initialTheme,
  initialPrimaryColor,
  initialColorPreset,
  initialEntryLayout,
  initialBorderRadius,
  initialFontFamily,
  initialUseHostTypography,
  initialSubmitButtonStyle,
  initialComposerTextScale,
  slots,
}: {
  projectId: string;
  previewWidgetMode: string;
  initialTheme: string;
  initialPrimaryColor: string;
  initialColorPreset: string;
  initialEntryLayout: string;
  initialBorderRadius: string;
  initialFontFamily: string;
  initialUseHostTypography: boolean;
  initialSubmitButtonStyle: string;
  initialComposerTextScale: string;
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
  const [entryLayout, setEntryLayout] = useState(
    ENTRY_LAYOUTS.some((l) => l.value === initialEntryLayout) ? initialEntryLayout : "list",
  );
  const [borderRadius, setBorderRadius] = useState(initialBorderRadius);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [useHostTypography, setUseHostTypography] = useState(initialUseHostTypography);
  const [submitButtonStyle, setSubmitButtonStyle] = useState<SubmitButtonStyle>(() =>
    submitButtonOptions.some((o) => o.value === initialSubmitButtonStyle)
      ? (initialSubmitButtonStyle as SubmitButtonStyle)
      : "filled",
  );
  const [composerTextScale, setComposerTextScale] = useState<ComposerTextScale>(() =>
    composerTextOptions.some((o) => o.value === initialComposerTextScale)
      ? (initialComposerTextScale as ComposerTextScale)
      : "md",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presetList = useMemo(() => COLOR_PRESETS.filter((p) => p.id !== "custom"), []);

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
      const res = await fetch(`/api/internal/projects/${projectId}/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          primaryColor,
          colorPreset,
          entryLayout,
          borderRadius,
          fontFamily,
          useHostTypography,
          submitButtonStyle,
          composerTextScale,
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
          <LayoutList className="h-4 w-4 text-brand" strokeWidth={2} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            Entry layout
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          How individual comments or reviews are arranged. The live widget applies the same structure inside your host
          container.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {ENTRY_LAYOUTS.map((opt) => {
            const Ico = layoutIcons[opt.value];
            const selected = entryLayout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEntryLayout(opt.value)}
                className={`flex flex-col items-start gap-2 rounded-md border px-3 py-3 text-left transition ${
                  selected
                    ? "border-brand/50 bg-brand-muted ring-1 ring-brand/25 dark:bg-brand/10 dark:ring-brand/35"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                }`}
              >
                <Ico className={`h-5 w-5 ${selected ? "text-brand" : "text-slate-500 dark:text-zinc-400"}`} />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                <span className="text-xs leading-snug text-slate-500 dark:text-zinc-500">{opt.description}</span>
              </button>
            );
          })}
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
            Submit button &amp; text
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Primary actions in the composer (Post, Continue, Submit) and base size for labels, inputs, and helper copy.
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
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600 dark:text-zinc-400">Composer text size</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {composerTextOptions.map((opt) => {
              const selected = composerTextScale === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setComposerTextScale(opt.value)}
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
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-brand" strokeWidth={2} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            Theme & shape
          </h3>
        </div>
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
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">Light, dark, or follow the visitor&apos;s system.</p>
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
      composerTextScale={composerTextScale}
      entryLayout={entryLayout}
    />
  );

  if (slots) {
    return slots({ optionsPanel, previewPanel });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4 dark:border-zinc-700">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">Appearance</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Widget look & layout</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            Layout, colors, and typography for the embed — published via <code className="text-xs">/api/v1/config</code>.
            Use <strong className="font-medium text-slate-800 dark:text-zinc-200">Options</strong> and{" "}
            <strong className="font-medium text-slate-800 dark:text-zinc-200">Preview</strong> on smaller screens.
            Install steps live under <strong className="font-medium text-slate-800 dark:text-zinc-200">How to use</strong>.
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
            Preview mode:{" "}
            <span className="text-slate-900 dark:text-white">
              {WIDGET_MODE_PREVIEW[normalizeWidgetMode(previewWidgetMode)].headline}
            </span>
            <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-zinc-500 sm:text-sm">
              {WIDGET_MODE_PREVIEW[normalizeWidgetMode(previewWidgetMode)].description}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileTab("options")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            mobileTab === "options"
              ? "bg-brand-muted text-brand-ink ring-1 ring-brand/25 dark:bg-brand/15 dark:text-brand"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          <Settings2 className="h-4 w-4" />
          Options
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            mobileTab === "preview"
              ? "bg-brand-muted text-brand-ink ring-1 ring-brand/25 dark:bg-brand/15 dark:text-brand"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(280px,34%)_1fr] lg:items-start lg:gap-8 xl:gap-10">
        <div className={`rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${mobileTab === "preview" ? "hidden lg:block" : ""}`}>
          {optionsPanel}
        </div>
        <div
          className={`lg:sticky lg:top-4 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:overflow-x-hidden ${mobileTab === "options" ? "hidden lg:block" : ""}`}
        >
          {previewPanel}
        </div>
      </div>
    </div>
  );
}
