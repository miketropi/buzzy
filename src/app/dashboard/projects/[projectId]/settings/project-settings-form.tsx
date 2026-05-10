"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WIDGET_MODE_PREVIEW, normalizeWidgetMode } from "@/lib/widget-mode-ux";

const widgetModes = ["comment", "review", "rating"] as const;
const captchaModeOptions = ["off", "anonymous_only", "risk", "always"] as const;

export function ProjectSettingsForm({
  projectId,
  initialName,
  initialWidgetMode,
  initialDomainsText,
  initialAutoApprove,
  initialEnableAttachments,
  initialAllowAnonymous,
  initialEnableSpamFilter,
  initialBlockedWordsText,
  initialBlockedIPsText,
  initialSpamMatchWholeWords,
  initialSpamMaxUrlsPerPost,
  initialSpamBlockedRegexText,
  initialSpamDuplicateWindowSeconds,
  initialSpamPerIdentityCommentLimit,
  initialSpamPerIdentityReviewLimit,
  initialSpamPerIdentityWindowSeconds,
  initialAkismetEnabled,
  initialAkismetHasKey,
  initialAkismetBlogUrl,
  initialAkismetRejectSpam,
  initialCaptchaProvider,
  initialCaptchaSiteKey,
  initialCaptchaHasSecretKey,
  initialCaptchaMode,
  initialCaptchaRiskMinLinks,
  initialCaptchaRiskMinScore,
  widgetMode: widgetModeControlled,
  onWidgetModeChange,
  embedded = false,
}: {
  projectId: string;
  initialName: string;
  initialWidgetMode: string;
  initialDomainsText: string;
  /** When true, new submissions are published without manual review (`requireApproval` false). */
  initialAutoApprove: boolean;
  initialEnableAttachments: boolean;
  initialAllowAnonymous: boolean;
  initialEnableSpamFilter: boolean;
  initialBlockedWordsText: string;
  initialBlockedIPsText: string;
  initialSpamMatchWholeWords: boolean;
  initialSpamMaxUrlsPerPost: number;
  initialSpamBlockedRegexText: string;
  initialSpamDuplicateWindowSeconds: number;
  initialSpamPerIdentityCommentLimit: number;
  initialSpamPerIdentityReviewLimit: number;
  initialSpamPerIdentityWindowSeconds: number;
  initialAkismetEnabled: boolean;
  initialAkismetHasKey: boolean;
  initialAkismetBlogUrl: string;
  initialAkismetRejectSpam: boolean;
  initialCaptchaProvider: string;
  initialCaptchaSiteKey: string;
  initialCaptchaHasSecretKey: boolean;
  initialCaptchaMode: string;
  initialCaptchaRiskMinLinks: number;
  initialCaptchaRiskMinScore: number;
  /** When set with `onWidgetModeChange`, widget mode is controlled (e.g. live preview). */
  widgetMode?: string;
  onWidgetModeChange?: (mode: string) => void;
  /** Omit outer card chrome when nested inside a parent surface (e.g. unified settings page). */
  embedded?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [internalWidgetMode, setInternalWidgetMode] = useState(initialWidgetMode);
  const widgetMode = widgetModeControlled !== undefined ? widgetModeControlled : internalWidgetMode;
  function setWidgetMode(v: string) {
    onWidgetModeChange?.(v);
    if (widgetModeControlled === undefined) {
      setInternalWidgetMode(v);
    }
  }
  const [domainsText, setDomainsText] = useState(initialDomainsText);
  const [autoApprove, setAutoApprove] = useState(initialAutoApprove);
  const [enableAttachments, setEnableAttachments] = useState(initialEnableAttachments);
  const [allowAnonymous, setAllowAnonymous] = useState(initialAllowAnonymous);
  const [enableSpamFilter, setEnableSpamFilter] = useState(initialEnableSpamFilter);
  const [blockedWordsText, setBlockedWordsText] = useState(initialBlockedWordsText);
  const [blockedIPsText, setBlockedIPsText] = useState(initialBlockedIPsText);
  const [spamMatchWholeWords, setSpamMatchWholeWords] = useState(initialSpamMatchWholeWords);
  const [spamMaxUrlsPerPost, setSpamMaxUrlsPerPost] = useState(initialSpamMaxUrlsPerPost);
  const [spamBlockedRegexText, setSpamBlockedRegexText] = useState(initialSpamBlockedRegexText);
  const [spamDuplicateWindowSeconds, setSpamDuplicateWindowSeconds] = useState(
    initialSpamDuplicateWindowSeconds,
  );
  const [spamPerIdentityCommentLimit, setSpamPerIdentityCommentLimit] = useState(
    initialSpamPerIdentityCommentLimit,
  );
  const [spamPerIdentityReviewLimit, setSpamPerIdentityReviewLimit] = useState(
    initialSpamPerIdentityReviewLimit,
  );
  const [spamPerIdentityWindowSeconds, setSpamPerIdentityWindowSeconds] = useState(
    initialSpamPerIdentityWindowSeconds,
  );
  const [akismetEnabled, setAkismetEnabled] = useState(initialAkismetEnabled);
  const [akismetApiKeyDraft, setAkismetApiKeyDraft] = useState("");
  const [clearAkismetApiKey, setClearAkismetApiKey] = useState(false);
  const [akismetBlogUrl, setAkismetBlogUrl] = useState(initialAkismetBlogUrl);
  const [akismetRejectSpam, setAkismetRejectSpam] = useState(initialAkismetRejectSpam);
  const [captchaProvider, setCaptchaProvider] = useState(
    initialCaptchaProvider === "turnstile" ? "turnstile" : "off",
  );
  const [captchaSiteKey, setCaptchaSiteKey] = useState(initialCaptchaSiteKey);
  const [captchaSecretDraft, setCaptchaSecretDraft] = useState("");
  const [clearCaptchaSecret, setClearCaptchaSecret] = useState(false);
  const [captchaMode, setCaptchaMode] = useState(() =>
    captchaModeOptions.includes(initialCaptchaMode as (typeof captchaModeOptions)[number])
      ? initialCaptchaMode
      : "anonymous_only",
  );
  const [captchaRiskMinLinks, setCaptchaRiskMinLinks] = useState(initialCaptchaRiskMinLinks);
  const [captchaRiskMinScore, setCaptchaRiskMinScore] = useState(initialCaptchaRiskMinScore);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const allowedDomains = domainsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const resProject = await fetch(`/api/internal/projects/${projectId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, widgetMode }),
      });
      const jsonProject = (await resProject.json()) as {
        success: boolean;
        error?: { message?: string };
      };
      if (!resProject.ok || !jsonProject.success) {
        setError(jsonProject.error?.message ?? "Update failed.");
        return;
      }

      const resDomains = await fetch(`/api/internal/projects/${projectId}/domains`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedDomains }),
      });
      const jsonDomains = (await resDomains.json()) as {
        success: boolean;
        error?: { message?: string };
      };
      if (!resDomains.ok || !jsonDomains.success) {
        setError(jsonDomains.error?.message ?? "Domains update failed.");
        return;
      }

      const blockedWords = blockedWordsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 400);
      const blockedIPs = blockedIPsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 200);

      const spamBlockedRegex = spamBlockedRegexText
        .split(/[\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 15)
        .map((s) => s.slice(0, 120));

      const captchaTurnstileFields =
        captchaProvider === "turnstile"
          ? {
              captchaProvider: "turnstile" as const,
              captchaSiteKey: captchaSiteKey.trim() || null,
              captchaMode,
              captchaRiskMinLinks: Math.min(100, Math.max(1, Math.floor(Number(captchaRiskMinLinks) || 4))),
              captchaRiskMinScore: Math.min(1, Math.max(0.01, Number(captchaRiskMinScore) || 0.55)),
              ...(clearCaptchaSecret ? { captchaSecretKey: null as null } : {}),
              ...(!clearCaptchaSecret && captchaSecretDraft.trim()
                ? { captchaSecretKey: captchaSecretDraft.trim() }
                : {}),
            }
          : {
              captchaProvider: "off" as const,
              captchaSiteKey: null as null,
              captchaSecretKey: null as null,
            };

      const resBehavior = await fetch(`/api/internal/projects/${projectId}/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requireApproval: !autoApprove,
          enableAttachments,
          allowAnonymous,
          enableSpamFilter,
          spamMatchWholeWords,
          spamMaxUrlsPerPost: Math.min(500, Math.max(0, Math.floor(Number(spamMaxUrlsPerPost) || 0))),
          spamBlockedRegex,
          spamDuplicateWindowSeconds: Math.min(
            604800,
            Math.max(0, Math.floor(Number(spamDuplicateWindowSeconds) || 0)),
          ),
          spamPerIdentityCommentLimit: Math.min(
            500,
            Math.max(0, Math.floor(Number(spamPerIdentityCommentLimit) || 0)),
          ),
          spamPerIdentityReviewLimit: Math.min(
            500,
            Math.max(0, Math.floor(Number(spamPerIdentityReviewLimit) || 0)),
          ),
          spamPerIdentityWindowSeconds: Math.min(
            604800,
            Math.max(60, Math.floor(Number(spamPerIdentityWindowSeconds) || 3600)),
          ),
          blockedWords,
          blockedIPs,
          akismetEnabled,
          akismetBlogUrl: akismetBlogUrl.trim() || null,
          akismetRejectSpam,
          ...(clearAkismetApiKey ? { akismetApiKey: null as null } : {}),
          ...(!clearAkismetApiKey && akismetApiKeyDraft.trim()
            ? { akismetApiKey: akismetApiKeyDraft.trim() }
            : {}),
          ...captchaTurnstileFields,
        }),
      });
      const jsonBehavior = (await resBehavior.json()) as {
        success: boolean;
        error?: { message?: string };
      };
      if (!resBehavior.ok || !jsonBehavior.success) {
        setError(jsonBehavior.error?.message ?? "Behavior preferences update failed.");
        return;
      }

      setMessage("Saved.");
      setAkismetApiKeyDraft("");
      setClearAkismetApiKey(false);
      setCaptchaSecretDraft("");
      setClearCaptchaSecret(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        embedded
          ? "space-y-4"
          : "space-y-4 rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      }
    >
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-200">
          {message}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
        />
      </div>

      <div>
        <label htmlFor="widgetMode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Widget mode
        </label>
        <select
          id="widgetMode"
          value={widgetMode}
          onChange={(e) => setWidgetMode(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
        >
          {widgetModes.map((m) => (
            <option key={m} value={m}>
              {WIDGET_MODE_PREVIEW[normalizeWidgetMode(m)].label} ({m})
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-500 sm:text-sm">
          {WIDGET_MODE_PREVIEW[normalizeWidgetMode(widgetMode)].description}
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200/90 bg-slate-50/60 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          Submissions &amp; guests
        </p>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">
              Automatic approval
            </span>
            <span className="block text-xs text-slate-500 dark:text-zinc-500">
              When on, new comments and reviews go live immediately. When off, they stay pending until you approve
              them in the dashboard.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={enableAttachments}
            onChange={(e) => setEnableAttachments(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">
              Allow image, video, and file uploads
            </span>
            <span className="block text-xs text-slate-500 dark:text-zinc-500">
              Requires storage configuration on the server. When off, the composer hides uploads and the API rejects
              attachments.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={allowAnonymous}
            onChange={(e) => setAllowAnonymous(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">
              Allow guest visitors
            </span>
            <span className="block text-xs text-slate-500 dark:text-zinc-500">
              When off, only recognized sessions or host SSO identities can post (depending on your setup).
            </span>
          </span>
        </label>
      </div>

      <details className="group rounded-lg border border-dashed border-slate-300/80 bg-slate-50/40 dark:border-zinc-600 dark:bg-zinc-900/25">
        <summary className="cursor-pointer list-none px-4 py-3 select-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">Advanced settings</p>
              <p className="mt-1 text-xs leading-snug text-slate-500 dark:text-zinc-500">
                Spam filtering, IP blocks, Akismet, and Cloudflare Turnstile. Open when you need tighter abuse
                controls.
              </p>
            </div>
            <ChevronDown
              className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 dark:text-zinc-500"
              aria-hidden
            />
          </div>
        </summary>
        <div className="space-y-4 border-t border-slate-200/80 px-3 pb-4 pt-2 dark:border-zinc-700">
          <div className="space-y-3 rounded-lg border border-slate-200/90 bg-slate-50/60 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          Spam filtering
        </p>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={enableSpamFilter}
            onChange={(e) => setEnableSpamFilter(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">
              Block submissions that match blocked words
            </span>
            <span className="block text-xs text-slate-500 dark:text-zinc-500">
              When on, phrases below trigger a block (case-insensitive). Use &quot;Match whole words only&quot;
              below to reduce false positives (for example substring matches inside harmless words).
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={spamMatchWholeWords}
            onChange={(e) => setSpamMatchWholeWords(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">
              Match whole words only for blocked phrases
            </span>
            <span className="block text-xs text-slate-500 dark:text-zinc-500">
              Off: substring match anywhere in the text (legacy behavior). On: single tokens use word boundaries;
              multi-word lines match as a bounded phrase between non-alphanumeric separators.
            </span>
          </span>
        </label>
        <div>
          <label htmlFor="blockedWords" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
            Blocked words or phrases (one per line)
          </label>
          <textarea
            id="blockedWords"
            rows={embedded ? 3 : 4}
            value={blockedWordsText}
            onChange={(e) => setBlockedWordsText(e.target.value)}
            placeholder={"casino\nclick here"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="spamRegex" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
            Block patterns with RegExp (one per line, optional)
          </label>
          <textarea
            id="spamRegex"
            rows={embedded ? 2 : 3}
            value={spamBlockedRegexText}
            onChange={(e) => setSpamBlockedRegexText(e.target.value)}
            placeholder={"https?:\\/\\/bit\\.ly\\/\\S+"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
            Case-insensitive JavaScript-style patterns; invalid lines are ignored at post time. Up to 15 patterns, 120
            characters each; avoid overly complex expressions.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="spamMaxUrls" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Max links per post
            </label>
            <input
              id="spamMaxUrls"
              type="number"
              min={0}
              max={500}
              value={spamMaxUrlsPerPost}
              onChange={(e) => setSpamMaxUrlsPerPost(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
              Counts http(s):// and www. URLs. 0 = no limit.
            </p>
          </div>
          <div>
            <label htmlFor="spamDupWindow" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Duplicate text window (seconds)
            </label>
            <input
              id="spamDupWindow"
              type="number"
              min={0}
              max={604800}
              value={spamDuplicateWindowSeconds}
              onChange={(e) => setSpamDuplicateWindowSeconds(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
              Block the same normalized message on the same page within this window. 0 = off. Example: 3600 = one
              hour.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="spamIdComments" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Max comments per identity
            </label>
            <input
              id="spamIdComments"
              type="number"
              min={0}
              max={500}
              value={spamPerIdentityCommentLimit}
              onChange={(e) => setSpamPerIdentityCommentLimit(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">0 = IP limits only.</p>
          </div>
          <div>
            <label htmlFor="spamIdReviews" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Max reviews per identity
            </label>
            <input
              id="spamIdReviews"
              type="number"
              min={0}
              max={500}
              value={spamPerIdentityReviewLimit}
              onChange={(e) => setSpamPerIdentityReviewLimit(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            />
          </div>
          <div>
            <label htmlFor="spamIdWin" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Identity window (sec)
            </label>
            <input
              id="spamIdWin"
              type="number"
              min={60}
              max={604800}
              value={spamPerIdentityWindowSeconds}
              onChange={(e) => setSpamPerIdentityWindowSeconds(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            />
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
          Identity limits run in addition to per-IP API rate limits (Redis fixed window), keyed by project and visitor —
          typically the widget commenter/token or SSO user.
        </p>

        <div>
          <label htmlFor="blockedIPs" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
            Blocked IP addresses (one per line)
          </label>
          <textarea
            id="blockedIPs"
            rows={embedded ? 2 : 3}
            value={blockedIPsText}
            onChange={(e) => setBlockedIPsText(e.target.value)}
            placeholder={"203.0.113.42"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
            Exact client IP matches from trusted proxy headers. Hosts rotate addresses, so combine with moderation.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200/90 bg-slate-50/60 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          Akismet &amp; captcha
        </p>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={akismetEnabled}
            onChange={(e) => setAkismetEnabled(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">
              Send public posts to Akismet (spam score)
            </span>
            <span className="block text-xs text-slate-500 dark:text-zinc-500">
              API key stays on the server. Set{" "}
              <code className="rounded bg-slate-200/80 px-1 dark:bg-zinc-800">BUZZY_AKISMET_DISABLED=1</code> to
              disable checks globally in an emergency.
            </span>
          </span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="akismetKey" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Akismet API key
            </label>
            <input
              id="akismetKey"
              type="password"
              autoComplete="off"
              value={akismetApiKeyDraft}
              onChange={(e) => {
                setAkismetApiKeyDraft(e.target.value);
                setClearAkismetApiKey(false);
              }}
              placeholder={
                initialAkismetHasKey && !clearAkismetApiKey
                  ? "Leave blank to keep existing key"
                  : "Paste key to store"
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            />
            {initialAkismetHasKey ? (
              <button
                type="button"
                className="mt-1 text-xs font-medium text-brand hover:underline dark:text-brand"
                onClick={() => {
                  setClearAkismetApiKey((v) => !v);
                  setAkismetApiKeyDraft("");
                }}
              >
                {clearAkismetApiKey ? "Keep existing key" : "Remove stored key"}
              </button>
            ) : null}
          </div>
          <div>
            <label htmlFor="akismetBlog" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Blog URL (Akismet)
            </label>
            <input
              id="akismetBlog"
              type="url"
              value={akismetBlogUrl}
              onChange={(e) => setAkismetBlogUrl(e.target.value)}
              placeholder="https://your-site.example"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            />
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={akismetRejectSpam}
            onChange={(e) => setAkismetRejectSpam(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">
              Reject when Akismet marks spam
            </span>
            <span className="block text-xs text-slate-500 dark:text-zinc-500">
              When off, posts Akismet marks as spam are still accepted.
            </span>
          </span>
        </label>

        <div className="border-t border-slate-200/80 pt-3 dark:border-zinc-700">
          <div>
            <label htmlFor="captchaProvider" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
              Captcha provider
            </label>
            <select
              id="captchaProvider"
              value={captchaProvider}
              onChange={(e) => setCaptchaProvider(e.target.value === "turnstile" ? "turnstile" : "off")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
            >
              <option value="off">Off</option>
              <option value="turnstile">Cloudflare Turnstile</option>
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
              Site key is embedded in the widget; secret key stays on the server for verification.
            </p>
          </div>
          {captchaProvider === "turnstile" ? (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="captchaSite" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Turnstile site key (public)
                </label>
                <input
                  id="captchaSite"
                  type="text"
                  value={captchaSiteKey}
                  onChange={(e) => setCaptchaSiteKey(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                />
              </div>
              <div>
                <label htmlFor="captchaSecret" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Turnstile secret key
                </label>
                <input
                  id="captchaSecret"
                  type="password"
                  autoComplete="off"
                  value={captchaSecretDraft}
                  onChange={(e) => {
                    setCaptchaSecretDraft(e.target.value);
                    setClearCaptchaSecret(false);
                  }}
                  placeholder={
                    initialCaptchaHasSecretKey && !clearCaptchaSecret
                      ? "Leave blank to keep existing secret"
                      : "Paste secret"
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                />
                {initialCaptchaHasSecretKey ? (
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-brand hover:underline dark:text-brand"
                    onClick={() => {
                      setClearCaptchaSecret((v) => !v);
                      setCaptchaSecretDraft("");
                    }}
                  >
                    {clearCaptchaSecret ? "Keep existing secret" : "Remove stored secret"}
                  </button>
                ) : null}
              </div>
              <div>
                <label htmlFor="captchaMode" className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
                  When to require captcha
                </label>
                <select
                  id="captchaMode"
                  value={captchaMode}
                  onChange={(e) => setCaptchaMode(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                >
                  <option value="off">Off</option>
                  <option value="anonymous_only">Guests only (no host SSO / no commenter token)</option>
                  <option value="risk">Risky-looking posts (links + local heuristics)</option>
                  <option value="always">Always</option>
                </select>
              </div>
              {captchaMode === "risk" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="captchaRiskLinks"
                      className="block text-xs font-medium text-slate-600 dark:text-zinc-400"
                    >
                      Risk: min URLs
                    </label>
                    <input
                      id="captchaRiskLinks"
                      type="number"
                      min={1}
                      max={100}
                      value={captchaRiskMinLinks}
                      onChange={(e) => setCaptchaRiskMinLinks(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="captchaRiskScore"
                      className="block text-xs font-medium text-slate-600 dark:text-zinc-400"
                    >
                      Risk: min heuristic score
                    </label>
                    <input
                      id="captchaRiskScore"
                      type="number"
                      step="0.01"
                      min={0.01}
                      max={1}
                      value={captchaRiskMinScore}
                      onChange={(e) => setCaptchaRiskMinScore(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
        </div>
      </details>

      <div>
        <label htmlFor="domains" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Allowed domains
        </label>
        <textarea
          id="domains"
          rows={embedded ? 3 : 4}
          value={domainsText}
          onChange={(e) => setDomainsText(e.target.value)}
          placeholder={"example.com\n*.example.com"}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
          One per line or comma-separated. Wildcards like *.example.com are supported.{" "}
          <Link
            href={`/dashboard/projects/${projectId}/settings/appearance`}
            className="font-medium text-brand hover:underline dark:text-brand"
          >
            Appearance
          </Link>{" "}
          uses a separate save.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
