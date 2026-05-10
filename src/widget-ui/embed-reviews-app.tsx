import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJson } from "../embed/embed-fetch";
import { getStoredToken, setStoredToken } from "../embed/embed-auth";
import { BUZZY_HOST_IDENTITY_EVENT, decodeHostIdentityPayloadForDisplay, getHostIdentityToken } from "../embed/embed-host-identity";
import { BUZZY_PROFILE_EVENT, getEmbedProfile } from "../embed/embed-profile";
import { modeShowsPublicRatingSummary, type PublicWidgetMode } from "../lib/widget-mode-ux";
import { WidgetInteractiveStars, WidgetStaticStars } from "./bz-stars";
import { WidgetReviewFeed, type ReviewFeedItem } from "./bz-review-card";
import { BzAttachmentsPanel } from "./bz-attachments-panel";
import { BzCommentEditor, type BzCommentEditorRef } from "./bz-comment-editor";
import { BzComposerSsoSummary } from "./bz-composer-sso-summary";
import { BzComposerModal } from "./bz-composer-modal";
import { BzModalIntro } from "./bz-modal-intro";
import { BzReportModal } from "./bz-report-modal";
import { BzIconChevronLeft, BzIconChevronRight } from "./bz-modal-nav-icons";
import type { EmbedAttachment } from "./attachment-types";
import {
  isRichEditorSubstantivelyEmpty,
  shouldSendRichHtml,
  strippedFromHtml,
} from "./rich-composer-helpers";
import { useHostIdentityProvisioned } from "./use-host-identity-provisioned";
import { widgetShouldShowTurnstileUi } from "@/lib/public-api/captcha-ui";
import { BzTurnstile } from "./bz-turnstile";

type Features = {
  allow_anonymous?: boolean;
  enable_rich_editor?: boolean;
  allow_attachments?: boolean;
};

type ApiReview = ReviewFeedItem;

export function EmbedReviewsApp({
  ctx,
  cfg,
  ratingOnly,
}: {
  ctx: { key: string; apiBase: string; pageUrl: string; pageTitle: string };
  cfg: Record<string, unknown>;
  ratingOnly: boolean;
}) {
  const scale = Math.min(10, Math.max(1, parseInt(String(cfg.rating_scale), 10) || 5));
  const mode: PublicWidgetMode = ratingOnly ? "rating" : "review";
  const showSummary = modeShowsPublicRatingSummary(mode);
  const ratingEnabled = !!cfg.enable_rating;
  const features = (cfg.features ?? {}) as Features;
  const allowGuestVisitors = features.allow_anonymous !== false;
  const enableRich = features.enable_rich_editor !== false;
  const uploadsOk =
    cfg.uploads_configured === true && features.allow_attachments !== false;

  const captchaSiteKey = typeof cfg.captcha_site_key === "string" ? cfg.captcha_site_key.trim() : "";
  const captchaMode = String(cfg.captcha_mode ?? "anonymous_only");
  const captchaRiskMinLinks =
    typeof cfg.captcha_risk_min_links === "number" && Number.isFinite(cfg.captcha_risk_min_links)
      ? cfg.captcha_risk_min_links
      : undefined;
  const captchaRiskMinScore =
    typeof cfg.captcha_risk_min_score === "number" && Number.isFinite(cfg.captcha_risk_min_score)
      ? cfg.captcha_risk_min_score
      : undefined;

  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [err, setErr] = useState("");
  const [name, setName] = useState(() => getEmbedProfile().name ?? "");
  const [email, setEmail] = useState(() => getEmbedProfile().email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(() => getEmbedProfile().avatarUrl ?? "");
  const hostSsoProvisioned = useHostIdentityProvisioned();
  const canCompose =
    allowGuestVisitors || Boolean(getStoredToken(ctx.key)) || hostSsoProvisioned;
  const [plainNote, setPlainNote] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<EmbedAttachment[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  /** Persists TipTap HTML when step 0 unmounts (Continue → step 1). */
  const [richDraftHtml, setRichDraftHtml] = useState("<p></p>");
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const editorRef = useRef<BzCommentEditorRef>(null);

  const loadSummary = useCallback(() => {
    if (!ratingEnabled) return Promise.resolve();
    const u =
      ctx.apiBase +
      "/api/v1/ratings/summary?key=" +
      encodeURIComponent(ctx.key) +
      "&page_url=" +
      encodeURIComponent(ctx.pageUrl);
    return fetchJson(u).then((j) => {
      const d = j.data as { averageRating?: number; totalReviews?: number };
      setAvg(d.averageRating != null ? d.averageRating : 0);
      setTotal(d.totalReviews != null ? d.totalReviews : 0);
    });
  }, [ratingEnabled, ctx.apiBase, ctx.key, ctx.pageUrl]);

  const loadList = useCallback(() => {
    if (!ratingEnabled) return Promise.resolve();
    const u =
      ctx.apiBase +
      "/api/v1/reviews?key=" +
      encodeURIComponent(ctx.key) +
      "&page_url=" +
      encodeURIComponent(ctx.pageUrl) +
      "&sort=newest";
    return fetchJson(u).then((j) => {
      let list = ((j.data as { reviews?: ApiReview[] })?.reviews || []) as ApiReview[];
      if (ratingOnly && list.length > 3) list = list.slice(0, 3);
      setReviews(
        typeof structuredClone === "function"
          ? structuredClone(list)
          : (JSON.parse(JSON.stringify(list)) as ApiReview[]),
      );
    });
  }, [ratingEnabled, ctx.apiBase, ctx.key, ctx.pageUrl, ratingOnly]);

  useEffect(() => {
    const sync = () => {
      const raw = getHostIdentityToken();
      const fromSso = raw ? decodeHostIdentityPayloadForDisplay(raw) : null;
      if (fromSso?.name != null || fromSso?.email != null || fromSso?.avatarUrl != null) {
        setName(fromSso.name ?? "");
        setEmail(fromSso.email ?? "");
        setAvatarUrl(fromSso.avatarUrl ?? "");
        return;
      }
      const p = getEmbedProfile();
      setName(p.name ?? "");
      setEmail(p.email ?? "");
      setAvatarUrl(p.avatarUrl ?? "");
    };
    sync();
    globalThis.addEventListener(BUZZY_PROFILE_EVENT, sync as EventListener);
    globalThis.addEventListener(BUZZY_HOST_IDENTITY_EVENT, sync as EventListener);
    return () => {
      globalThis.removeEventListener(BUZZY_PROFILE_EVENT, sync as EventListener);
      globalThis.removeEventListener(BUZZY_HOST_IDENTITY_EVENT, sync as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!ratingEnabled) return;
    let cancelled = false;
    setErr("");
    loadSummary()
      .catch(() => {
        if (!cancelled) {
          setAvg(0);
          setTotal(0);
        }
      })
      .then(() => loadList())
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message || String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [ratingEnabled, loadSummary, loadList]);

  const trustedPoster = Boolean(getStoredToken(ctx.key)) || hostSsoProvisioned;
  const onCaptchaToken = useCallback((t: string | null) => {
    setCaptchaToken(t);
  }, []);

  const closeComposer = useCallback(() => {
    setComposerOpen(false);
    setComposerStep(0);
    setCaptchaToken(null);
    setCaptchaNonce((n) => n + 1);
  }, []);

  const goReviewStep2 = useCallback(() => {
    setErr("");
    if (!hostSsoProvisioned && !name.trim()) {
      setErr("Please enter your name.");
      return;
    }
    if (!rating) {
      setErr("Please choose a star rating.");
      return;
    }
    if (enableRich) {
      const html = editorRef.current?.getValues().html ?? "<p></p>";
      setRichDraftHtml(html);
    }
    setCaptchaToken(null);
    setCaptchaNonce((n) => n + 1);
    setComposerStep(1);
  }, [name, rating, enableRich, hostSsoProvisioned]);

  function buildReviewSpamProbeForCaptcha(): string {
    const title = "";
    let plainFromText = "";
    let plainFromHtml = "";
    if (enableRich) {
      const rawHtml = richDraftHtml.trim();
      plainFromHtml = rawHtml;
      plainFromText = strippedFromHtml(rawHtml);
    } else {
      plainFromText = plainNote.trim();
    }
    const attProbe = attachments.map((a) => `${a.filename ?? ""}\t${a.url}`).join("\n");
    return [title, plainFromText, plainFromHtml, attProbe].join("\n");
  }

  function submitReview() {
    setErr("");
    if (!rating) {
      setErr("Please choose a star rating.");
      return;
    }
    if (!hostSsoProvisioned && !name.trim()) {
      setErr("Please go back and enter your name.");
      return;
    }
    setSubmitting(true);

    const postName = (name.trim() || "Community member").slice(0, 120);

    const body: Record<string, unknown> = {
      page_url: ctx.pageUrl,
      page_title: ctx.pageTitle,
      rating,
      commenter: {
        name: postName,
        email: email.trim(),
      },
    };

    const requireText = cfg.require_rating_text === true;
    const hasAtt = attachments.length > 0;

    if (enableRich) {
      const fromEd = editorRef.current?.getValues();
      const rawHtml = (fromEd != null ? fromEd.html : richDraftHtml).trim();
      const rawText = (fromEd?.text ?? "").trim();
      const noteEmpty = isRichEditorSubstantivelyEmpty(rawHtml, rawText);
      if (requireText && noteEmpty && !hasAtt) {
        setErr(ratingOnly ? "Add a written note or an attachment." : "Written review or an attachment is required for this project.");
        setSubmitting(false);
        return;
      }
      if (!noteEmpty) {
        const plainFromHtml = strippedFromHtml(rawHtml);
        body.content = rawText || plainFromHtml;
        if (shouldSendRichHtml(rawHtml)) {
          body.html = rawHtml;
        }
      }
    } else {
      const trimmed = plainNote.trim();
      if (requireText && !trimmed && !hasAtt) {
        setErr("Written review or an attachment is required for this project.");
        setSubmitting(false);
        return;
      }
      if (trimmed) body.content = trimmed;
    }

    if (hasAtt) {
      body.attachments = attachments;
    }

    const plainFromTextForCaptcha = typeof body.content === "string" ? body.content : "";
    const plainFromHtmlForCaptcha = typeof body.html === "string" ? body.html : "";
    const attProbe = attachments.map((a) => `${a.filename ?? ""}\t${a.url}`).join("\n");
    const captchaProbePost = ["", plainFromTextForCaptcha, plainFromHtmlForCaptcha, attProbe].join("\n");
    if (
      widgetShouldShowTurnstileUi({
        hasSiteKey: Boolean(captchaSiteKey),
        mode: captchaMode,
        trustedPoster,
        spamProbePlain: captchaProbePost,
        riskMinLinks: captchaRiskMinLinks,
        riskMinScore: captchaRiskMinScore,
      })
    ) {
      if (!captchaToken?.trim()) {
        setErr("Please complete the verification step.");
        setSubmitting(false);
        return;
      }
      body.captcha_token = captchaToken.trim();
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const tok = getStoredToken(ctx.key);
    if (tok) headers["X-Commenter-Token"] = tok;

    fetchJson(ctx.apiBase + "/api/v1/reviews?key=" + encodeURIComponent(ctx.key), {
      method: "POST",
      headers,
      body,
    })
      .then((j) => {
        const d = j.data as { review?: { status?: string }; commenter_token?: string };
        if (d?.commenter_token) setStoredToken(ctx.key, d.commenter_token);
        setErr("");
        setSuccessMsg(
          d.review?.status === "pending"
            ? ratingOnly
              ? "Your rating was saved and is waiting for approval. It will show here after a moderator publishes it."
              : "Your review was saved and is waiting for approval. It will show here after a moderator publishes it."
            : ratingOnly
              ? "Thanks! Your rating was submitted."
              : "Thanks! Your review was posted.",
        );
        setPlainNote("");
        setAttachments([]);
        setRating(0);
        setRichDraftHtml("<p></p>");
        if (enableRich) editorRef.current?.clear();
        closeComposer();
        return Promise.all([loadSummary(), loadList()]);
      })
      .catch((e: Error) => {
        setErr(e.message || String(e));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  const heading = ratingOnly ? "Rating" : "Reviews";

  if (!ratingEnabled) {
    return (
      <div className="bz-main-stack">
        <p className="bz-head">{heading}</p>
        <p className="bz-msg">Ratings are disabled for this project.</p>
      </div>
    );
  }

  const noteLabelId = enableRich ? "buzzy-r-note-editor" : "buzzy-r-note";
  const reviewStepLabels = ratingOnly
    ? ["Rating", "Files"]
    : ["Review", "Files"];
  const modalTitle = ratingOnly ? "Send a rating" : "Write a review";
  const ctaLabel = ratingOnly ? "Rate this" : "Write a review";
  const captchaProbeForUi = composerOpen && composerStep === 1 ? buildReviewSpamProbeForCaptcha() : "";
  const showTurnstile =
    composerOpen &&
    composerStep === 1 &&
    widgetShouldShowTurnstileUi({
      hasSiteKey: Boolean(captchaSiteKey),
      mode: captchaMode,
      trustedPoster,
      spamProbePlain: captchaProbeForUi,
      riskMinLinks: captchaRiskMinLinks,
      riskMinScore: captchaRiskMinScore,
    });

  return (
    <div className="bz-main-stack">
      {showSummary && !ratingOnly ? (
        <div className="bz-embed-section">
          <p className="bz-head">Reviews</p>
          <div className="bz-sum bz-sum-head">
            <span className="bz-big">{avg.toFixed(1)}</span>
            <WidgetStaticStars filled={Math.round(avg)} scale={scale} />
            <span className="bz-meta">
              Based on {total} {total === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      ) : null}

      {showSummary && ratingOnly ? (
        <div className="bz-embed-section">
          <div className="bz-flex-between">
            <div>
              <p className="bz-head">Average rating</p>
              <div className="bz-sum bz-sum-head">
                <span className="bz-big">{avg.toFixed(1)}</span>
                <WidgetStaticStars filled={Math.round(avg)} scale={scale} />
              </div>
            </div>
            <span className="bz-meta">
              {total} {total === 1 ? "rating" : "ratings"}
            </span>
          </div>
        </div>
      ) : null}

      <div className="bz-embed-section">
        <p className="bz-head">{heading}</p>
        <div className="bz-thread-entries">
          {reviews.length ? (
            <WidgetReviewFeed
              reviews={reviews}
              scale={scale}
              onReportReview={(id) => setReportReviewId(id)}
            />
          ) : ratingOnly ? null : (
            <p className="bz-meta">No reviews yet.</p>
          )}
        </div>

        {successMsg ? <p className="bz-success">{successMsg}</p> : null}
        {err && !composerOpen ? <p className="bz-msg">{err}</p> : null}

        <div className="bz-comp--cta">
          {!canCompose && ratingEnabled ? (
            <p className="bz-meta">Sign in to leave a rating.</p>
          ) : null}
          <button
            type="button"
            className="bz-btn bz-btn--block"
            disabled={!canCompose || !ratingEnabled}
            title={
              !ratingEnabled
                ? "Ratings are disabled for this project."
                : !canCompose
                  ? "Sign in to leave a rating."
                  : undefined
            }
            onClick={() => {
              if (!canCompose || !ratingEnabled) return;
              setErr("");
              setSuccessMsg("");
              setComposerStep(0);
              setRichDraftHtml("<p></p>");
              setCaptchaToken(null);
              setCaptchaNonce((n) => n + 1);
              setComposerOpen(true);
            }}
          >
            {ctaLabel}
          </button>
        </div>

        <BzComposerModal
          open={composerOpen}
          onClose={closeComposer}
          title={modalTitle}
          stepIndex={composerStep}
          totalSteps={2}
          stepLabels={reviewStepLabels}
          footer={
            <div className="bz-modal-footer-inner">
              {composerStep === 0 ? (
                <>
                  <button type="button" className="bz-btn--secondary bz-btn--modal" onClick={closeComposer}>
                    Cancel
                  </button>
                  <button type="button" className="bz-btn bz-btn--modal bz-btn--modal-primary" onClick={goReviewStep2}>
                    Continue
                    <BzIconChevronRight className="bz-ico bz-ico--trailing" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="bz-btn--secondary bz-btn--modal"
                    onClick={() => {
                      setErr("");
                      setComposerStep(0);
                      setCaptchaToken(null);
                      setCaptchaNonce((n) => n + 1);
                    }}
                    disabled={submitting}
                  >
                    <BzIconChevronLeft className="bz-ico bz-ico--leading" />
                    Back
                  </button>
                  <button
                    type="button"
                    className="bz-btn bz-btn--modal bz-btn--modal-primary"
                    disabled={submitting}
                    onClick={() => submitReview()}
                  >
                    {submitting ? "Sending…" : "Submit"}
                  </button>
                </>
              )}
            </div>
          }
        >
          {err && composerOpen ? <p className="bz-msg">{err}</p> : null}
          {composerStep === 0 ? (
            <>
              <BzModalIntro>
                {hostSsoProvisioned
                  ? ratingOnly
                    ? "You're signed in below — tap the stars, add an optional note, then continue. Files are in the next step."
                    : "You're signed in below — rate your experience and share what stood out. Optional files are in the next step."
                  : ratingOnly
                    ? "Introduce yourself and tap the stars — then add an optional note. You can attach screenshots or files in the next step if that tells the story better."
                    : "Share who you are, rate your experience, and write what stood out. Photos or docs are optional and come next — focus on your words first."}
              </BzModalIntro>
              {hostSsoProvisioned ? (
                <BzComposerSsoSummary name={name.trim()} email={email.trim()} avatarUrl={avatarUrl.trim() || undefined} />
              ) : (
                <>
                  <div className="bz-form-field">
                    <label className="bz-l" htmlFor="buzzy-r-name">
                      Your name
                    </label>
                    <input
                      id="buzzy-r-name"
                      className="bz-in"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="bz-form-field">
                    <label className="bz-l" htmlFor="buzzy-r-email">
                      Email (optional)
                    </label>
                    <input
                      id="buzzy-r-email"
                      className="bz-in"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="bz-form-field bz-form-field--rating">
                <label className="bz-l" htmlFor="buzzy-r-stars">
                  Your rating
                </label>
                <div className="bz-rating-input">
                  <span id="buzzy-r-stars">
                    <WidgetInteractiveStars scale={scale} value={rating} onChange={setRating} />
                  </span>
                </div>
              </div>
              <div className="bz-form-field">
                {ratingOnly ? (
                  <label className="bz-l" htmlFor={noteLabelId}>
                    Note (optional)
                  </label>
                ) : (
                  <label className="bz-l" htmlFor={noteLabelId}>
                    Review (optional)
                  </label>
                )}
                {enableRich ? (
                  <div id="buzzy-r-note-editor">
                    <BzCommentEditor
                      ref={editorRef}
                      disabled={submitting}
                      initialHtml={richDraftHtml}
                      placeholder={
                        ratingOnly
                          ? "Optional note… You can add files in the next step."
                          : "Share your experience… Files and photos go in the next step."
                      }
                    />
                  </div>
                ) : (
                  <textarea
                    id="buzzy-r-note"
                    className="bz-in"
                    name="content"
                    rows={5}
                    value={plainNote}
                    onChange={(e) => setPlainNote(e.target.value)}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <BzModalIntro>
                Add visuals or documents here, or skip entirely — your rating and note from step 1 are enough to submit.
              </BzModalIntro>
              <div className="bz-form-field">
                <label className="bz-l" htmlFor="buzzy-r-attachments">
                  Attachments
                </label>
                <div id="buzzy-r-attachments">
                  <BzAttachmentsPanel
                    items={attachments}
                    onChange={setAttachments}
                    uploadsEnabled={uploadsOk}
                    disabled={submitting}
                    apiBase={ctx.apiBase}
                    apiKey={ctx.key}
                  />
                </div>
              </div>
              {showTurnstile ? (
                <div className="bz-form-field">
                  <span className="bz-l">Verification</span>
                  <BzTurnstile siteKey={captchaSiteKey} onToken={onCaptchaToken} resetKey={captchaNonce} />
                </div>
              ) : null}
            </>
          )}
        </BzComposerModal>
      </div>
      <BzReportModal
        open={reportReviewId !== null}
        onClose={() => setReportReviewId(null)}
        apiBase={ctx.apiBase}
        apiKey={ctx.key}
        variant="review"
        targetId={reportReviewId}
      />
    </div>
  );
}
