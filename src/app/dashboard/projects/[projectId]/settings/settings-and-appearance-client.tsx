"use client";

import { Palette, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import type { ColorPresetId } from "@/lib/appearance-presets";
import { WIDGET_MODE_PREVIEW, normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { ProjectAppearanceForm } from "../appearance/project-appearance-form";
import { ProjectSettingsForm } from "./project-settings-form";

type InitialAppearance = {
  theme: string;
  primary: string;
  colorPreset: ColorPresetId;
  entryLayout: string;
  borderRadius: string;
  fontFamily: string;
  useHostTypography: boolean;
  submitButtonStyle: string;
  composerTextScale: string;
};

export function SettingsAndAppearanceClient({
  projectId,
  initialName,
  initialWidgetMode,
  initialModerationMode,
  initialDomainsText,
  initialAutoApprove,
  initialEnableAttachments,
  initialAllowAnonymous,
  appearance,
}: {
  projectId: string;
  initialName: string;
  initialWidgetMode: string;
  initialModerationMode: string;
  initialDomainsText: string;
  initialAutoApprove: boolean;
  initialEnableAttachments: boolean;
  initialAllowAnonymous: boolean;
  appearance: InitialAppearance;
}) {
  const [widgetMode, setWidgetMode] = useState(initialWidgetMode);

  useEffect(() => {
    setWidgetMode(initialWidgetMode);
  }, [initialWidgetMode]);

  const modeMeta = WIDGET_MODE_PREVIEW[normalizeWidgetMode(widgetMode)];

  return (
    <div className="pb-8">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-[0.9375rem]">
        Configure behavior and access, then tune layout and colors. The live preview follows widget mode and
        appearance — including the two-step comment and review composer.
      </p>

      <ProjectAppearanceForm
        projectId={projectId}
        previewWidgetMode={widgetMode}
        initialTheme={appearance.theme}
        initialPrimaryColor={appearance.primary}
        initialColorPreset={appearance.colorPreset}
        initialEntryLayout={appearance.entryLayout}
        initialBorderRadius={appearance.borderRadius}
        initialFontFamily={appearance.fontFamily}
        initialUseHostTypography={appearance.useHostTypography}
        initialSubmitButtonStyle={appearance.submitButtonStyle}
        initialComposerTextScale={appearance.composerTextScale}
        slots={({ optionsPanel, previewPanel }) => (
          <div className="dash-panel overflow-hidden">
            <div className="lg:grid lg:grid-cols-[minmax(300px,44%)_1fr]">
              <div
                className="min-w-0 divide-y"
                style={{ borderColor: "var(--border)" }}
              >
                <section className="p-5 sm:p-6 lg:p-7">
                  <div className="mb-5 flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/20 dark:bg-brand/20">
                      <SlidersHorizontal className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
                        Behavior & access
                      </h2>
                      <p className="mt-1 text-sm leading-snug text-[var(--muted)]">
                        Project name, widget mode, moderation, guests, uploads, approval, and allowed domains
                      </p>
                    </div>
                  </div>
                  <ProjectSettingsForm
                    projectId={projectId}
                    initialName={initialName}
                    initialWidgetMode={initialWidgetMode}
                    initialModerationMode={initialModerationMode}
                    initialDomainsText={initialDomainsText}
                    initialAutoApprove={initialAutoApprove}
                    initialEnableAttachments={initialEnableAttachments}
                    initialAllowAnonymous={initialAllowAnonymous}
                    widgetMode={widgetMode}
                    onWidgetModeChange={setWidgetMode}
                    embedded
                  />
                </section>

                <section className="p-5 sm:p-6 lg:p-7">
                  <div className="mb-5 flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/20 dark:bg-brand/20">
                      <Palette className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
                        Look & feel
                      </h2>
                      <p className="mt-1 text-sm leading-snug text-[var(--muted)]">
                        Published with your project via{" "}
                        <code
                          className="rounded-md px-1.5 py-0.5 text-[0.75rem]"
                          style={{ background: "var(--surface-muted)", border: "1px solid var(--border)" }}
                        >
                          GET /api/v1/config
                        </code>
                      </p>
                    </div>
                  </div>
                  {optionsPanel}
                </section>
              </div>

              <aside className="dash-aside lg:sticky lg:top-4 lg:self-start">
                <div className="px-4 pt-5 sm:px-6">
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      border: "1px solid var(--border)",
                      background: "linear-gradient(120deg, var(--accent-subtle), transparent 65%)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">Preview</p>
                    <p className="mt-2 text-sm leading-snug text-[var(--foreground)]">
                      <span className="font-semibold">{modeMeta.headline}</span>
                      <span className="text-[var(--muted)]"> — </span>
                      <span className="text-[var(--muted)]">{modeMeta.description}</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 sm:p-5">{previewPanel}</div>
              </aside>
            </div>
          </div>
        )}
      />
    </div>
  );
}
