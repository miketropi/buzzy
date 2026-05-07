"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useId, useMemo, useSyncExternalStore } from "react";
import type { EntryLayout } from "@/lib/appearance-presets";
import { WIDGET_CHROME_STRUCTURAL_SCOPED } from "@/lib/generated/widget-chrome-scoped";
import {
  buildScopedWidgetStylesheet,
  dashboardToTokenInput,
  type ComposerTextScale,
  type SubmitButtonStyle,
} from "@/lib/widget-chrome-tokens";
import type { PublicWidgetMode } from "@/lib/widget-mode-ux";
import { modeShowsPublicRatingSummary } from "@/lib/widget-mode-ux";
import { BzComposerModalFrame } from "@/widget-ui/bz-composer-modal-frame";
import { BzIconChevronRight } from "@/widget-ui/bz-modal-nav-icons";
import { WidgetComposerStarsStatic } from "@/widget-ui/bz-composer-stars-static";
import { WidgetCommentCard } from "@/widget-ui/bz-comment-card";
import { WidgetReviewCard } from "@/widget-ui/bz-review-card";
import { BzModalIntro } from "@/widget-ui/bz-modal-intro";
import { WidgetStaticStars } from "@/widget-ui/bz-stars";

const PreviewRichCommentEditor = dynamic(
  () => import("@/widget-ui/bz-comment-editor").then((m) => m.BzCommentEditor),
  {
    ssr: false,
    loading: () => (
      <div className="bz-composer-surface" aria-hidden>
        <div className="bz-editor-toolbar">
          {["B", "I", "U", "•", "1.", "❝", "Link"].map((x) => (
            <span key={x} className="bz-editor-toolbar-btn bz-editor-toolbar-btn--fake">
              {x}
            </span>
          ))}
        </div>
        <div className="bz-composer-editor-body">
          <div className="bz-tiptap" style={{ minHeight: "6rem", opacity: 0.35 }} />
        </div>
      </div>
    ),
  },
);

function resolvePreviewSurface(theme: string): "light" | "dark" {
  if (theme === "dark") return "dark";
  return "light";
}

const HOST_FONT_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function usePrefersDarkSnapshot() {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false),
    () => false,
  );
}

export function WidgetAppearancePreview({
  widgetMode,
  theme,
  primaryColor,
  borderRadius,
  fontFamily,
  useHostTypography,
  submitButtonStyle,
  composerTextScale,
  submitButtonFgColor,
  mutedTextColor,
  entryLayout,
}: {
  widgetMode: PublicWidgetMode;
  theme: string;
  primaryColor: string;
  borderRadius: string;
  fontFamily: string;
  useHostTypography: boolean;
  submitButtonStyle: SubmitButtonStyle;
  composerTextScale: ComposerTextScale;
  /** Normalized #RRGGBB or null (auto label on solid fills). */
  submitButtonFgColor: string | null;
  mutedTextColor: string | null;
  entryLayout: string;
}) {
  const layout = (["list", "card_grid", "carousel"].includes(entryLayout) ? entryLayout : "list") as EntryLayout;
  const prefersDark = usePrefersDarkSnapshot();
  const surface =
    theme === "auto" ? (prefersDark ? "dark" : "light") : resolvePreviewSurface(theme);
  const previewFont = useHostTypography ? HOST_FONT_FALLBACK : fontFamily;
  const autoNote = theme === "auto";

  const commentModalTitleId = useId();
  const reviewModalTitleId = useId();
  const ratingModalTitleId = useId();
  const commentModalHintsId = useId();
  const reviewModalHintsId = useId();
  const ratingModalHintsId = useId();

  const modalPreviewFooter = (
    <div className="bz-modal-footer-inner">
      <button type="button" className="bz-btn--secondary bz-btn--modal" disabled>
        Cancel
      </button>
      <button type="button" className="bz-btn bz-btn--modal bz-btn--modal-primary" disabled>
        Continue
        <BzIconChevronRight className="bz-ico bz-ico--trailing" />
      </button>
    </div>
  );

  const commentStepIntro = (
    <>
      <BzModalIntro>
        Step 1 is your name, optional email, and what you want to say. Step 2 is optional uploads — keep this screen
        clean until you need files.
      </BzModalIntro>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-c-name">
          Your name
        </label>
        <input id="bz-ap-c-name" className="bz-in" readOnly value="Jordan L." />
      </div>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-c-email">
          Email (optional)
        </label>
        <input id="bz-ap-c-email" className="bz-in" readOnly value="" placeholder="you@example.com" />
      </div>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-c-editor">
          Comment
        </label>
        <div id="bz-ap-c-editor">
          <PreviewRichCommentEditor
            disabled
            decorativeToolbar
            placeholder="Write your comment… Formatting tools below — uploads are in the next step."
          />
        </div>
      </div>
    </>
  );

  const reviewStepIntro = (
    <>
      <BzModalIntro>
        Share who you are, rate your experience, and write what stood out. Photos or docs are optional and come next —
        focus on your words first.
      </BzModalIntro>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-r-name">
          Your name
        </label>
        <input id="bz-ap-r-name" className="bz-in" readOnly value="Jordan L." />
      </div>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-r-email">
          Email (optional)
        </label>
        <input id="bz-ap-r-email" className="bz-in" readOnly value="" placeholder="you@example.com" />
      </div>
      <div className="bz-form-field bz-form-field--rating">
        <label className="bz-l" htmlFor="bz-ap-r-stars">
          Your rating
        </label>
        <div className="bz-rating-input">
          <span id="bz-ap-r-stars">
            <WidgetComposerStarsStatic hideLabel />
          </span>
        </div>
      </div>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-r-editor">
          Review (optional)
        </label>
        <div id="bz-ap-r-editor">
          <PreviewRichCommentEditor
            disabled
            decorativeToolbar
            placeholder="Share your experience… Files and photos go in the next step."
          />
        </div>
      </div>
    </>
  );

  const ratingStepIntro = (
    <>
      <BzModalIntro>
        Introduce yourself and tap the stars — then add an optional note. You can attach screenshots or files in the
        next step if that tells the story better.
      </BzModalIntro>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-rt-name">
          Your name
        </label>
        <input id="bz-ap-rt-name" className="bz-in" readOnly value="Jordan L." />
      </div>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-rt-email">
          Email (optional)
        </label>
        <input id="bz-ap-rt-email" className="bz-in" readOnly value="" placeholder="you@example.com" />
      </div>
      <div className="bz-form-field bz-form-field--rating">
        <label className="bz-l" htmlFor="bz-ap-rt-stars">
          Your rating
        </label>
        <div className="bz-rating-input">
          <span id="bz-ap-rt-stars">
            <WidgetComposerStarsStatic hideLabel />
          </span>
        </div>
      </div>
      <div className="bz-form-field">
        <label className="bz-l" htmlFor="bz-ap-rt-editor">
          Note (optional)
        </label>
        <div id="bz-ap-rt-editor">
          <PreviewRichCommentEditor
            disabled
            decorativeToolbar
            placeholder="Optional note… You can add files in the next step."
          />
        </div>
      </div>
    </>
  );

  function inlineComposerBlock(opts: {
    ctaLabel: string;
    modalTitle: string;
    titleId: string;
    hintsId: string;
    stepLabels: [string, string];
    step0: ReactNode;
  }) {
    return (
      <>
        <div className="bz-comp--cta">
          <button type="button" className="bz-btn bz-btn--block" disabled>
            {opts.ctaLabel}
          </button>
        </div>
        <p className="bz-meta bz-modal-inline-caption">
          On your site this opens as a sheet over a dimmed backdrop. It is shown inline here so typography and colors
          match the live embed.
        </p>
        <div className="bz-modal-stack-inline">
          <BzComposerModalFrame
            inline
            titleId={opts.titleId}
            title={opts.modalTitle}
            stepIndex={0}
            totalSteps={2}
            stepLabels={opts.stepLabels}
            footer={modalPreviewFooter}
            describedBy={opts.hintsId}
          >
            {opts.step0}
          </BzComposerModalFrame>
        </div>
      </>
    );
  }

  const chromeSheet = useMemo(
    () =>
      buildScopedWidgetStylesheet(
        ".buzzy-widget-scope .bz",
        dashboardToTokenInput(
          theme,
          primaryColor,
          borderRadius,
          fontFamily,
          useHostTypography,
          prefersDark,
          submitButtonStyle,
          composerTextScale,
          submitButtonFgColor,
          mutedTextColor,
        ),
        WIDGET_CHROME_STRUCTURAL_SCOPED,
      ),
    [
      theme,
      primaryColor,
      borderRadius,
      fontFamily,
      useHostTypography,
      prefersDark,
      submitButtonStyle,
      composerTextScale,
      submitButtonFgColor,
      mutedTextColor,
    ],
  );

  const hostPageBg =
    surface === "dark"
      ? "linear-gradient(180deg, #0c0e0b 0%, #121512 40%, #161916 100%)"
      : "linear-gradient(180deg, #eef0eb 0%, #f6f7f4 35%, #fafbf8 100%)";

  const showSummary = modeShowsPublicRatingSummary(widgetMode);
  const isRatingOnly = widgetMode === "rating";
  const scale = 5;

  const ratingSummaryBlock =
    showSummary && !isRatingOnly ? (
      <div className="bz-embed-section">
        <p className="bz-head">Reviews</p>
        <div className="bz-sum bz-sum-head">
          <span className="bz-big">4.3</span>
          <WidgetStaticStars filled={4} scale={scale} />
          <span className="bz-meta">Based on 128 reviews</span>
        </div>
      </div>
    ) : null;

  const compactRatingBlock =
    showSummary && isRatingOnly ? (
      <div className="bz-embed-section">
        <div className="bz-flex-between">
          <div>
            <p className="bz-head">Average rating</p>
            <div className="bz-sum bz-sum-head">
              <span className="bz-big">4.3</span>
              <WidgetStaticStars filled={4} scale={scale} />
            </div>
          </div>
          <span className="bz-meta">128 ratings</span>
        </div>
      </div>
    ) : null;

  const listBodies = [
    "Clear layout and fast load — feels native on our storefront. Would recommend for teams shipping their own stack.",
    "Nested threads stayed readable on mobile. We matched our brand colors without extra CSS.",
  ];

  const reviewGridData = [
    { initials: "AM", name: "Alex M.", body: "Shipped fast and docs were clear. Happy with the integration path.", stars: 5 },
    { initials: "SK", name: "Sam K.", body: "Four stars — great product, wish filters were a bit faster.", stars: 4 },
    { initials: "JL", name: "Jordan L.", body: "Solid build quality. Would buy again.", stars: 5 },
    { initials: "ER", name: "Eli R.", body: "Does what it says on the tin.", stars: 4 },
  ];

  const gridData = [
    { initials: "AM", name: "Alex M.", body: "Shipped fast and docs were clear. Happy with the integration path." },
    { initials: "SK", name: "Sam K.", body: "Star ratings and comments in one block — exactly what we needed for PDP." },
    { initials: "JL", name: "Jordan L.", body: "Moderation hooks feel production-ready. Origin checks gave us confidence." },
    { initials: "ER", name: "Eli R.", body: "Carousel layout works well above the fold on our landing experiments." },
  ];

  function buildCommentEntries(variant: "comfortable" | "compact"): ReactNode {
    if (layout === "card_grid") {
      return (
        <div className="bz-grid bz-grid--2">
          {gridData.map((row) => (
            <WidgetCommentCard key={row.initials + row.name} variant={variant} initials={row.initials} name={row.name} body={row.body} />
          ))}
        </div>
      );
    }
    if (layout === "carousel") {
      return (
        <div>
          <p className="bz-carousel-hint">
            Swipe or scroll horizontally — cards use most of the widget width on smaller breakpoints.
          </p>
          <div className="bz-carousel">
            {gridData.slice(0, 3).map((row, i) => (
              <div key={row.name} className="bz-carousel-card">
                <WidgetCommentCard variant="compact" initials={row.initials} name={row.name} body={row.body} />
                <p className="bz-carousel-label">Card {i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="bz-list">
        <div className="bz-entry-list-group">
          {listBodies.map((b, i) => (
            <WidgetCommentCard key={i} variant="comfortable" body={b} cardSurface="flat" />
          ))}
        </div>
      </div>
    );
  }

  function buildReviewEntries(variant: "comfortable" | "compact"): ReactNode {
    if (layout === "card_grid") {
      return (
        <div className="bz-grid bz-grid--2">
          {reviewGridData.map((row) => (
            <WidgetReviewCard
              key={row.initials + row.name}
              variant={variant}
              initials={row.initials}
              name={row.name}
              body={row.body}
              starRating={row.stars}
              scale={scale}
            />
          ))}
        </div>
      );
    }
    if (layout === "carousel") {
      return (
        <div className="bz-carousel">
          {reviewGridData.slice(0, 3).map((row, i) => (
            <div key={row.name} className="bz-carousel-card">
              <WidgetReviewCard
                variant="compact"
                initials={row.initials}
                name={row.name}
                body={row.body}
                starRating={row.stars}
                scale={scale}
              />
              <p className="bz-carousel-label">Card {i + 1}</p>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="bz-list">
        <div className="bz-entry-list-group">
          {reviewGridData.slice(0, 2).map((row) => (
            <WidgetReviewCard
              key={row.name}
              variant="comfortable"
              initials={row.initials}
              name={row.name}
              body={row.body}
              starRating={row.stars}
              scale={scale}
              surface="flat"
            />
          ))}
        </div>
      </div>
    );
  }

  const sectionTitleSuffix =
    layout === "list" ? "" : layout === "card_grid" ? " · card grid" : " · carousel";

  function threadPanel(opts: { title: string; entries: ReactNode; footer: ReactNode }) {
    return (
      <div className="bz-embed-section">
        <p className="bz-head">{opts.title}</p>
        <div className="bz-thread-entries">{opts.entries}</div>
        {opts.footer}
      </div>
    );
  }

  let mainBlocks: ReactNode;
  if (widgetMode === "comment") {
    mainBlocks = (
      <>
        {threadPanel({
          title: `Comments${sectionTitleSuffix}`,
          entries: buildCommentEntries(layout === "card_grid" ? "comfortable" : layout === "carousel" ? "compact" : "comfortable"),
          footer: inlineComposerBlock({
            ctaLabel: "Write a comment",
            modalTitle: "Post a comment",
            titleId: commentModalTitleId,
            hintsId: commentModalHintsId,
            stepLabels: ["Profile", "Files"],
            step0: commentStepIntro,
          }),
        })}
      </>
    );
  } else if (widgetMode === "review") {
    mainBlocks = (
      <>
        {ratingSummaryBlock}
        {threadPanel({
          title: `Reviews${sectionTitleSuffix}`,
          entries: buildReviewEntries(layout === "card_grid" ? "comfortable" : layout === "carousel" ? "compact" : "comfortable"),
          footer: inlineComposerBlock({
            ctaLabel: "Write a review",
            modalTitle: "Write a review",
            titleId: reviewModalTitleId,
            hintsId: reviewModalHintsId,
            stepLabels: ["Review", "Files"],
            step0: reviewStepIntro,
          }),
        })}
      </>
    );
  } else {
    mainBlocks = (
      <>
        {compactRatingBlock}
        {threadPanel({
          title: `Ratings${sectionTitleSuffix}`,
          entries: buildReviewEntries(layout === "card_grid" ? "comfortable" : layout === "carousel" ? "compact" : "comfortable"),
          footer: inlineComposerBlock({
            ctaLabel: "Rate this",
            modalTitle: "Send a rating",
            titleId: ratingModalTitleId,
            hintsId: ratingModalHintsId,
            stepLabels: ["Rating", "Files"],
            step0: ratingStepIntro,
          }),
        })}
      </>
    );
  }

  const previewHint =
    useHostTypography || autoNote ? (
      <p className="mb-4 text-center text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
        {useHostTypography ? (
          <>
            <span className="font-medium text-slate-600 dark:text-zinc-400">Typography</span> matches the host page.
          </>
        ) : null}
        {useHostTypography && autoNote ? (
          <span className="mx-1.5 inline text-slate-400 dark:text-zinc-600" aria-hidden>
            ·
          </span>
        ) : null}
        {autoNote ? (
          <>
            <span className="font-medium text-slate-600 dark:text-zinc-400">Theme auto</span> follows your system
            setting.
          </>
        ) : null}
      </p>
    ) : null;

  return (
    <div
      className="flex min-h-[min(32rem,70vh)] flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/35 dark:border-zinc-600/35"
      style={{ fontFamily: previewFont }}
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-10 sm:py-12"
        style={{ background: hostPageBg }}
      >
        <div className="mx-auto max-w-xl">
          {previewHint}

          <div className="buzzy-widget-scope">
            <style dangerouslySetInnerHTML={{ __html: chromeSheet }} />
            <div className={`bz bz-btn-style--${submitButtonStyle} bz-text-scale--${composerTextScale}`}>
              <div className="bz-main-stack">{mainBlocks}</div>
            </div>
          </div>

          <p className="mt-4 text-center text-[0.7rem] text-slate-400 dark:text-zinc-600">
            Same chrome as <code className="rounded bg-slate-200/60 px-1 py-px text-[0.65rem] dark:bg-zinc-800/80">buzzy.js</code>
          </p>
        </div>
      </div>
    </div>
  );
}
