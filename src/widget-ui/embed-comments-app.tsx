import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "../embed/embed-fetch";
import { getStoredToken, setStoredToken } from "../embed/embed-auth";
import {
  BUZZY_HOST_IDENTITY_EVENT,
  decodeHostIdentityPayloadForDisplay,
  getHostIdentityToken,
} from "../embed/embed-host-identity";
import { BUZZY_PROFILE_EVENT, getEmbedProfile } from "../embed/embed-profile";
import {
  CommentThreadContext,
  type CommentForEdit,
  type CommentThreadContextValue,
} from "./comment-thread-context";
import { WidgetCommentThread, type ThreadComment } from "./bz-comment-card";
import { BzAttachmentsPanel } from "./bz-attachments-panel";
import { BzAttachmentsDisplay } from "./bz-attachments-display";
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
import { BzCommentsThreadSkeleton } from "./bz-comments-skeleton";
import { nearestVerticalScrollIntersectionRoot } from "./infinite-scroll-intersect";

type CommentSort = "newest" | "oldest" | "popular";

const COMMENT_SORT_NAV: { value: CommentSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Top" },
];

/** Cursor pages are root threads; replies load with each slice (see listCommentsForPage). */
const COMMENT_PAGE_SIZE = 20;

function cloneThreadComments(list: ThreadComment[]): ThreadComment[] {
  return typeof structuredClone === "function"
    ? structuredClone(list)
    : (JSON.parse(JSON.stringify(list)) as ThreadComment[]);
}

type CommentsFetchMeta = {
  total?: number;
  cursor?: string;
  hasMore?: boolean;
};

function parseServiceHostname(apiBase: string): string | null {
  try {
    const trimmed = apiBase.trim().replace(/\/$/, "");
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const h = new URL(withProto).hostname;
    return h || null;
  } catch {
    return null;
  }
}

type Features = {
  allow_anonymous?: boolean;
  enable_replies?: boolean;
  enable_voting?: boolean;
  enable_rich_editor?: boolean;
  allow_attachments?: boolean;
};

export function EmbedCommentsApp({
  ctx,
  cfg,
}: {
  ctx: { key: string; apiBase: string; pageUrl: string; pageTitle: string };
  cfg: Record<string, unknown>;
}) {
  const features = (cfg.features ?? {}) as Features;
  const allowGuestVisitors = features.allow_anonymous !== false;
  const enableReplies = features.enable_replies !== false;
  const enableVoting = features.enable_voting !== false;
  const enableRich = features.enable_rich_editor !== false;
  const uploadsOk = cfg.uploads_configured === true && features.allow_attachments !== false;
  /** When uploads are off, attachment step is omitted — compose and submit in one step. */
  const attachmentStepEnabled = uploadsOk;

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

  const [rows, setRows] = useState<ThreadComment[]>([]);
  const [sort, setSort] = useState<CommentSort>("newest");
  const [approvedCommentTotal, setApprovedCommentTotal] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(() => getEmbedProfile().name ?? "");
  const [email, setEmail] = useState(() => getEmbedProfile().email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(() => getEmbedProfile().avatarUrl ?? "");
  const hostSsoProvisioned = useHostIdentityProvisioned();
  /** Mirrors public API: posting allowed for guests, returning commenters (token), or Host SSO. */
  const canCompose =
    allowGuestVisitors || Boolean(getStoredToken(ctx.key)) || hostSsoProvisioned;
  const [plainContent, setPlainContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [voteBusyId, setVoteBusyId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<EmbedAttachment[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  /** Persists TipTap HTML when step 0 unmounts; used when posting from step 2. */
  const [richDraftHtml, setRichDraftHtml] = useState("<p></p>");
  /** When set, composer is patching this comment instead of posting a new one. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const editorRef = useRef<BzCommentEditorRef>(null);
  const plainRef = useRef<HTMLTextAreaElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const rowsRef = useRef(rows);
  const nextCursorRef = useRef(nextCursor);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);
  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const serviceHost = useMemo(() => parseServiceHostname(ctx.apiBase), [ctx.apiBase]);

  const applyCursorMeta = useCallback((meta: CommentsFetchMeta | undefined | null) => {
    const c = typeof meta?.cursor === "string" ? meta.cursor : null;
    const hm = Boolean(meta?.hasMore && c);
    setNextCursor(hm ? c : null);
    setHasMore(hm);
  }, []);

  const fetchCommentsPage = useCallback(
    async (cursor: string | undefined) => {
      const q = new URLSearchParams();
      q.set("key", ctx.key);
      q.set("page_url", ctx.pageUrl);
      q.set("sort", sort);
      q.set("limit", String(COMMENT_PAGE_SIZE));
      if (cursor) q.set("cursor", cursor);
      const u = `${ctx.apiBase}/api/v1/comments?${q.toString()}`;
      const tok = getStoredToken(ctx.key);
      const headers: Record<string, string> = {};
      if (tok) headers["X-Commenter-Token"] = tok;
      const j = (await fetchJson(u, { headers })) as {
        data?: { comments?: ThreadComment[] };
        meta?: CommentsFetchMeta;
      };
      return j;
    },
    [ctx.apiBase, ctx.key, ctx.pageUrl, sort],
  );

  /** After votes / edits / posts, refetch root pages until list length is restored when possible. */
  const replenishCommentsQuietly = useCallback(async () => {
    const neededRoots = rowsRef.current.length;
    try {
      if (neededRoots === 0) {
        const j = await fetchCommentsPage(undefined);
        const list = ((j.data?.comments ?? []) as ThreadComment[]) || [];
        setRows(cloneThreadComments(list));
        if (typeof j.meta?.total === "number") setApprovedCommentTotal(j.meta.total);
        else setApprovedCommentTotal(null);
        applyCursorMeta(j.meta);
        return;
      }
      let acc: ThreadComment[] = [];
      let cursor: string | undefined;
      let lastMeta: CommentsFetchMeta | undefined;
      while (true) {
        const j = await fetchCommentsPage(cursor);
        lastMeta = j.meta;
        const chunk = (j.data?.comments ?? []) as ThreadComment[];
        acc = [...acc, ...chunk];
        const c =
          typeof j.meta?.cursor === "string" && j.meta.hasMore ? (j.meta.cursor as string) : undefined;
        if (!chunk.length || !j.meta?.hasMore || !c) break;
        if (acc.length >= neededRoots) break;
        cursor = c;
      }
      setRows(cloneThreadComments(acc));
      if (typeof lastMeta?.total === "number") setApprovedCommentTotal(lastMeta.total);
      applyCursorMeta(lastMeta);
    } catch {
      try {
        const j = await fetchCommentsPage(undefined);
        const list = (j.data?.comments ?? []) as ThreadComment[];
        setRows(cloneThreadComments(list));
        if (typeof j.meta?.total === "number") setApprovedCommentTotal(j.meta.total);
        applyCursorMeta(j.meta);
      } catch {
        /* keep visible list */
      }
    }
  }, [fetchCommentsPage, applyCursorMeta]);

  const load = useCallback(
    async (opts?: { quiet?: boolean }) => {
      setErr("");
      if (!opts?.quiet) setLoading(true);
      try {
        const j = await fetchCommentsPage(undefined);
        const list = ((j.data?.comments ?? []) as ThreadComment[]) || [];
        setRows(cloneThreadComments(list));
        if (typeof j.meta?.total === "number") setApprovedCommentTotal(j.meta.total);
        else setApprovedCommentTotal(null);
        applyCursorMeta(j.meta);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        setRows([]);
        setApprovedCommentTotal(null);
        setNextCursor(null);
        setHasMore(false);
      } finally {
        if (!opts?.quiet) setLoading(false);
      }
    },
    [fetchCommentsPage, applyCursorMeta],
  );

  const loadMore = useCallback(async () => {
    if (
      loadingMoreRef.current ||
      loadingRef.current ||
      !hasMoreRef.current ||
      nextCursorRef.current == null ||
      nextCursorRef.current === ""
    ) {
      return;
    }
    const cur = nextCursorRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setErr("");
    try {
      const j = await fetchCommentsPage(cur);
      const chunk = ((j.data?.comments ?? []) as ThreadComment[]) || [];
      setRows((prev) => [...prev, ...cloneThreadComments(chunk)]);
      if (typeof j.meta?.total === "number") setApprovedCommentTotal(j.meta.total);
      applyCursorMeta(j.meta);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchCommentsPage, applyCursorMeta]);

  useEffect(() => {
    if (loading || !hasMore || rows.length === 0) return;
    const el = sentinelRef.current;
    if (!el) return;
    const root = nearestVerticalScrollIntersectionRoot(el);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        void loadMore();
      },
      { root, rootMargin: "160px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore, rows.length, nextCursor, loadMore]);


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
    void load();
  }, [load]);

  const vote = useCallback(
    async (commentId: string, value: 1 | -1 | 0) => {
      const tok = getStoredToken(ctx.key);
      if (!tok) {
        setErr("Post a comment once so we can enable voting on this device.");
        return;
      }
      setVoteBusyId(commentId);
      setErr("");
      setSuccessMsg("");
      try {
        await fetchJson(`${ctx.apiBase}/api/v1/comments/${commentId}/vote?key=${encodeURIComponent(ctx.key)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Commenter-Token": tok,
          },
          body: { value },
        });
        await replenishCommentsQuietly();
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setVoteBusyId(null);
      }
    },
    [ctx.apiBase, ctx.key, replenishCommentsQuietly],
  );

  const onEditComment = useCallback(
    (c: CommentForEdit) => {
      if (!getStoredToken(ctx.key)) {
        setErr("Use the same browser where you posted this comment to edit it.");
        return;
      }
      setErr("");
      setSuccessMsg("");
      setParentId(null);
      setEditingId(c.id);
      setPlainContent(c.content ?? "");
      setRichDraftHtml(c.html_content?.trim() ? (c.html_content as string) : "<p></p>");
      setAttachments(c.attachments ?? []);
      setComposerStep(0);
      setCaptchaToken(null);
      setCaptchaNonce((n) => n + 1);
      setComposerOpen(true);
      if (enableRich) requestAnimationFrame(() => editorRef.current?.focus());
      else requestAnimationFrame(() => plainRef.current?.focus());
    },
    [ctx.key, enableRich],
  );

  const onReply = useCallback(
    (id: string) => {
      setEditingId(null);
      setParentId(id);
      setRichDraftHtml("<p></p>");
      setComposerStep(0);
      setCaptchaToken(null);
      setCaptchaNonce((n) => n + 1);
      setComposerOpen(true);
      if (enableRich) requestAnimationFrame(() => editorRef.current?.focus());
      else requestAnimationFrame(() => plainRef.current?.focus());
    },
    [enableRich],
  );

  const onQuote = useCallback(
    (_cid: string, authorName: string, excerpt: string) => {
      setEditingId(null);
      setComposerStep(0);
      setRichDraftHtml("<p></p>");
      setCaptchaToken(null);
      setCaptchaNonce((n) => n + 1);
      setComposerOpen(true);
      if (enableRich) {
        requestAnimationFrame(() => {
          editorRef.current?.insertQuote(authorName, excerpt);
          editorRef.current?.focus();
        });
      } else {
        const q = excerpt.trim().slice(0, 400);
        const prefix = `> ${authorName}: ${q}\n\n`;
        setPlainContent((p) => prefix + p);
        requestAnimationFrame(() => plainRef.current?.focus());
      }
    },
    [enableRich],
  );

  const threadCtx = useMemo<CommentThreadContextValue>(
    () => ({
      enableReplies,
      enableVoting,
      onReply,
      onQuote,
      onVote: vote,
      voteBusyId,
      onEdit: onEditComment,
      onReport: (id: string) => setReportCommentId(id),
      canCompose,
    }),
    [enableReplies, enableVoting, onReply, onQuote, vote, voteBusyId, onEditComment, canCompose],
  );

  const trustedPoster = Boolean(getStoredToken(ctx.key)) || hostSsoProvisioned;
  const onCaptchaToken = useCallback((t: string | null) => {
    setCaptchaToken(t);
  }, []);

  const closeComposer = useCallback(() => {
    setComposerOpen(false);
    setComposerStep(0);
    setEditingId(null);
    setCaptchaToken(null);
    setCaptchaNonce((n) => n + 1);
  }, []);

  const goCommentStep2 = useCallback(() => {
    setErr("");
    if (editingId || !attachmentStepEnabled) return;
    if (!hostSsoProvisioned && !name.trim()) {
      setErr("Please enter your name.");
      return;
    }
    if (enableRich) {
      const html = editorRef.current?.getValues().html ?? "<p></p>";
      setRichDraftHtml(html);
    }
    setCaptchaToken(null);
    setCaptchaNonce((n) => n + 1);
    setComposerStep(1);
  }, [name, enableRich, editingId, hostSsoProvisioned, attachmentStepEnabled]);

  function buildCommentSpamProbeForCaptcha(): string {
    let plainFromText = "";
    let plainFromHtml = "";
    if (enableRich) {
      const rawHtml = richDraftHtml.trim();
      plainFromHtml = rawHtml;
      plainFromText = strippedFromHtml(rawHtml);
    } else {
      plainFromText = plainContent.trim();
    }
    const attProbe = attachments.map((a) => `${a.filename ?? ""}\t${a.url}`).join("\n");
    return `${plainFromText}\n${plainFromHtml}\n${attProbe}`;
  }

  function submitComment() {
    setErr("");

    if (editingId) {
      const tok = getStoredToken(ctx.key);
      if (!tok) {
        setErr("Session missing. Post a comment once on this device, then try again.");
        return;
      }

      setSubmitting(true);

      const patchBody: Record<string, unknown> = {};
      const hasExistingAtt = attachments.length > 0;

      if (enableRich) {
        const fromEd = editorRef.current?.getValues();
        const rawHtml = (fromEd != null ? fromEd.html : richDraftHtml).trim();
        const rawText = (fromEd?.text ?? "").trim();
        if (isRichEditorSubstantivelyEmpty(rawHtml, rawText) && !hasExistingAtt) {
          setErr("Add a comment or keep your attachments.");
          setSubmitting(false);
          return;
        }
        if (!isRichEditorSubstantivelyEmpty(rawHtml, rawText)) {
          patchBody.content = rawText || strippedFromHtml(rawHtml);
          if (shouldSendRichHtml(rawHtml)) {
            patchBody.html = rawHtml;
          }
        } else if (hasExistingAtt) {
          patchBody.content = "(attachments)";
        }
      } else {
        if (!plainContent.trim() && !hasExistingAtt) {
          setErr("Add a comment or keep your attachments.");
          setSubmitting(false);
          return;
        }
        if (plainContent.trim()) patchBody.content = plainContent.trim();
        else if (hasExistingAtt) patchBody.content = "(attachments)";
      }

      fetchJson(
        `${ctx.apiBase}/api/v1/comments/${encodeURIComponent(editingId)}?key=${encodeURIComponent(ctx.key)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Commenter-Token": tok,
          },
          body: patchBody,
        },
      )
        .then(() => {
          setErr("");
          setSuccessMsg("Your comment was updated.");
          setPlainContent("");
          setAttachments([]);
          setParentId(null);
          setRichDraftHtml("<p></p>");
          if (enableRich) editorRef.current?.clear();
          closeComposer();
          void replenishCommentsQuietly();
        })
        .catch((e: Error) => {
          setErr(e.message || String(e));
        })
        .finally(() => {
          setSubmitting(false);
        });
      return;
    }

    setSubmitting(true);

    const postName = (name.trim() || "Community member").slice(0, 120);

    const body: Record<string, unknown> = {
      page_url: ctx.pageUrl,
      page_title: ctx.pageTitle,
      commenter: {
        name: postName,
        email: email.trim(),
      },
    };

    const hasAtt = attachments.length > 0;

    if (enableRich) {
      const fromEd = editorRef.current?.getValues();
      const rawHtml = (fromEd != null ? fromEd.html : richDraftHtml).trim();
      const rawText = (fromEd?.text ?? "").trim();
      if (isRichEditorSubstantivelyEmpty(rawHtml, rawText) && !hasAtt) {
        setErr("Add a comment or at least one attachment.");
        setSubmitting(false);
        return;
      }
      if (!isRichEditorSubstantivelyEmpty(rawHtml, rawText)) {
        const plainFromHtml = strippedFromHtml(rawHtml);
        body.content = rawText || plainFromHtml;
        if (shouldSendRichHtml(rawHtml)) {
          body.html = rawHtml;
        }
      }
    } else {
      if (!plainContent.trim() && !hasAtt) {
        setErr("Add a comment or at least one attachment.");
        setSubmitting(false);
        return;
      }
      if (plainContent.trim()) body.content = plainContent.trim();
    }

    if (hasAtt) {
      body.attachments = attachments;
    }

    if (parentId) body.parent_id = parentId;

    if (!hostSsoProvisioned && !name.trim()) {
      setErr("Name is required.");
      setSubmitting(false);
      return;
    }

    const attProbe = attachments.map((a) => `${a.filename ?? ""}\t${a.url}`).join("\n");
    const plainFromTextForCaptcha = typeof body.content === "string" ? body.content : "";
    const plainFromHtmlForCaptcha = typeof body.html === "string" ? body.html : "";
    const captchaProbePost = `${plainFromTextForCaptcha}\n${plainFromHtmlForCaptcha}\n${attProbe}`;
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

    fetchJson(ctx.apiBase + "/api/v1/comments?key=" + encodeURIComponent(ctx.key), {
      method: "POST",
      headers,
      body,
    })
      .then((j) => {
        const d = j.data as { comment?: { status?: string }; commenter_token?: string };
        if (d?.commenter_token) setStoredToken(ctx.key, d.commenter_token);
        setErr("");
        setSuccessMsg(
          d.comment?.status === "pending"
            ? "Your comment was saved and is waiting for approval. It will show here after a moderator publishes it."
            : "Your comment was posted.",
        );
        setPlainContent("");
        setAttachments([]);
        setParentId(null);
        setRichDraftHtml("<p></p>");
        if (enableRich) editorRef.current?.clear();
        closeComposer();
        void replenishCommentsQuietly();
      })
      .catch((e: Error) => {
        setErr(e.message || String(e));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  const commentStepLabels = attachmentStepEnabled ? ["Profile", "Files"] : ["Comment"];
  const isEditing = editingId !== null;
  const composeModalSteps = isEditing ? 1 : attachmentStepEnabled ? 2 : 1;
  const captchaProbeForUi =
    composerOpen && editingId === null
      ? buildCommentSpamProbeForCaptcha()
      : "";
  const captchaOnAttachmentsStepOnly = attachmentStepEnabled && !isEditing;
  const showTurnstile =
    composerOpen &&
    editingId === null &&
    (captchaOnAttachmentsStepOnly ? composerStep === 1 : composerStep === 0) &&
    widgetShouldShowTurnstileUi({
      hasSiteKey: Boolean(captchaSiteKey),
      mode: captchaMode,
      trustedPoster,
      spamProbePlain: captchaProbeForUi,
      riskMinLinks: captchaRiskMinLinks,
      riskMinScore: captchaRiskMinScore,
    });

  const countSummary =
    !loading && approvedCommentTotal === null
      ? "—"
      : approvedCommentTotal !== null
        ? `${approvedCommentTotal} ${approvedCommentTotal === 1 ? "comment" : "comments"}`
        : null;

  return (
    <div className="bz-main-stack">
      <div className="bz-embed-section">
        <p className="bz-head">Comments</p>
        <div className="bz-widget-toolbar">
          <span className="bz-widget-toolbar-count">
            {loading && approvedCommentTotal === null ? (
              <span className="bz-skeleton-toolbar-count bz-skeleton-shimmer" aria-hidden />
            ) : (
              countSummary
            )}
          </span>
          <div className="bz-widget-toolbar-sort">
            <nav className="bz-widget-sort-nav" aria-label="Sort comments">
              {COMMENT_SORT_NAV.map(({ value, label }) => {
                const active = sort === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={active ? "bz-sort-nav-btn bz-sort-nav-btn--active" : "bz-sort-nav-btn"}
                    disabled={loading}
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      if (active) return;
                      setSort(value);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <CommentThreadContext.Provider value={threadCtx}>
          <div className="bz-thread-entries" aria-busy={loading || loadingMore}>
            {loading ? (
              <>
                <span className="bz-sr-only">Loading comments…</span>
                <BzCommentsThreadSkeleton rows={3} />
              </>
            ) : rows.length ? (
              <>
                <WidgetCommentThread items={rows} variant="comfortable" />
                {hasMore ? (
                  <>
                    <div ref={sentinelRef} className="bz-load-more-sentinel" aria-hidden />
                    {loadingMore ? (
                      <>
                        <span className="bz-sr-only">Loading more comments…</span>
                        <div className="bz-load-more-skel-wrap" aria-hidden>
                          <BzCommentsThreadSkeleton rows={2} />
                        </div>
                      </>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : (
              <p className="bz-meta">No comments yet.</p>
            )}
          </div>
        </CommentThreadContext.Provider>
        {successMsg ? <p className="bz-success">{successMsg}</p> : null}
        {err && !composerOpen ? <p className="bz-msg">{err}</p> : null}
        <div className="bz-comp--cta">
          {parentId ? (
            <p className="bz-meta bz-comp-reply-hint">
              Replying in thread ·{" "}
              <button type="button" className="bz-link" onClick={() => setParentId(null)}>
                Cancel reply
              </button>
            </p>
          ) : null}
          {!canCompose && !loading ? (
            <p className="bz-meta">Sign in to add a comment.</p>
          ) : null}
          <button
            type="button"
            className="bz-btn bz-btn--block"
            disabled={!canCompose}
            title={
              canCompose
                ? undefined
                : "Sign in to add a comment."
            }
            onClick={() => {
              if (!canCompose) return;
              setErr("");
              setSuccessMsg("");
              setEditingId(null);
              setComposerStep(0);
              setRichDraftHtml("<p></p>");
              setCaptchaToken(null);
              setCaptchaNonce((n) => n + 1);
              setComposerOpen(true);
            }}
          >
            {parentId ? "Continue reply" : "Write a comment"}
          </button>
        </div>
        <BzComposerModal
          open={composerOpen}
          onClose={closeComposer}
          title={isEditing ? "Edit comment" : parentId ? "Reply" : "Post a comment"}
          stepIndex={isEditing ? 0 : composerStep}
          totalSteps={composeModalSteps}
          stepLabels={isEditing ? ["Edit comment"] : commentStepLabels}
          footer={
            <div className="bz-modal-footer-inner">
              {isEditing ? (
                <>
                  <button type="button" className="bz-btn--secondary bz-btn--modal" onClick={closeComposer}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bz-btn bz-btn--modal bz-btn--modal-primary"
                    disabled={submitting}
                    onClick={() => submitComment()}
                  >
                    {submitting ? "Saving…" : "Save changes"}
                  </button>
                </>
              ) : !attachmentStepEnabled ? (
                <>
                  <button type="button" className="bz-btn--secondary bz-btn--modal" onClick={closeComposer}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bz-btn bz-btn--modal bz-btn--modal-primary"
                    disabled={submitting}
                    onClick={() => submitComment()}
                  >
                    {submitting ? "Posting…" : "Post comment"}
                  </button>
                </>
              ) : composerStep === 0 ? (
                <>
                  <button type="button" className="bz-btn--secondary bz-btn--modal" onClick={closeComposer}>
                    Cancel
                  </button>
                  <button type="button" className="bz-btn bz-btn--modal bz-btn--modal-primary" onClick={goCommentStep2}>
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
                    onClick={() => submitComment()}
                  >
                    {submitting ? "Posting…" : "Post comment"}
                  </button>
                </>
              )}
            </div>
          }
        >
          {err && composerOpen ? <p className="bz-msg">{err}</p> : null}
          {isEditing ? (
            <>
              <BzModalIntro>
                Update your text here. You can edit for a short time after posting, on the same browser you used to
                comment. Existing attachments stay on the comment.
              </BzModalIntro>
              {attachments.length > 0 ? (
                <div className="bz-form-field">
                  <span className="bz-l">Attachments</span>
                  <BzAttachmentsDisplay items={attachments} compact={false} />
                </div>
              ) : null}
              <div className="bz-form-field">
                <label className="bz-l" htmlFor={enableRich ? "buzzy-c-editor" : "buzzy-c-content"}>
                  Comment
                </label>
                {enableRich ? (
                  <div id="buzzy-c-editor">
                    <BzCommentEditor
                      ref={editorRef}
                      disabled={submitting}
                      initialHtml={richDraftHtml}
                      placeholder="Edit your comment…"
                    />
                  </div>
                ) : (
                  <textarea
                    ref={plainRef}
                    id="buzzy-c-content"
                    className="bz-in"
                    name="content"
                    rows={5}
                    value={plainContent}
                    onChange={(e) => setPlainContent(e.target.value)}
                  />
                )}
              </div>
            </>
          ) : !attachmentStepEnabled || composerStep === 0 ? (
            <>
              {attachmentStepEnabled ? (
                hostSsoProvisioned ? (
                  parentId ? (
                    <BzModalIntro>
                      You&apos;re replying in a thread — your note nests under the original comment. Add images or
                      documents in step 2, or skip straight to post if it&apos;s text only.
                    </BzModalIntro>
                  ) : (
                    <BzModalIntro>
                      You&apos;re signed in with your host account below. Step 2 is optional uploads — add files there or
                      skip straight to post.
                    </BzModalIntro>
                  )
                ) : parentId ? (
                  <BzModalIntro>
                    You&apos;re replying in a thread — your note nests under the original comment. Add images or documents
                    in step 2, or skip straight to post if it&apos;s text only.
                  </BzModalIntro>
                ) : (
                  <BzModalIntro>
                    Step 1 is your name, optional email, and what you want to say. Step 2 is optional uploads — keep this
                    screen clean until you need files.
                  </BzModalIntro>
                )
              ) : hostSsoProvisioned ? (
                parentId ? (
                  <BzModalIntro>
                    You&apos;re replying in a thread — your note nests under the original comment.
                  </BzModalIntro>
                ) : (
                  <BzModalIntro>You&apos;re signed in with your host account below.</BzModalIntro>
                )
              ) : parentId ? (
                <BzModalIntro>
                  You&apos;re replying in a thread — your note nests under the original comment.
                </BzModalIntro>
              ) : (
                <BzModalIntro>Add your name, optional email, and your comment — then post.</BzModalIntro>
              )}
              {hostSsoProvisioned ? (
                <BzComposerSsoSummary name={name.trim()} email={email.trim()} avatarUrl={avatarUrl.trim() || undefined} />
              ) : (
                <>
                  <div className="bz-form-field">
                    <label className="bz-l" htmlFor="buzzy-c-name">
                      Your name
                    </label>
                    <input
                      id="buzzy-c-name"
                      className="bz-in"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="bz-form-field">
                    <label className="bz-l" htmlFor="buzzy-c-email">
                      Email (optional)
                    </label>
                    <input
                      id="buzzy-c-email"
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
              <div className="bz-form-field">
                <label className="bz-l" htmlFor={enableRich ? "buzzy-c-editor" : "buzzy-c-content"}>
                  Comment
                </label>
                {enableRich ? (
                  <div id="buzzy-c-editor">
                    <BzCommentEditor
                      ref={editorRef}
                      disabled={submitting}
                      initialHtml={richDraftHtml}
                      placeholder={
                        attachmentStepEnabled
                          ? "Write your comment… Formatting tools below — uploads are in the next step."
                          : "Write your comment…"
                      }
                    />
                  </div>
                ) : (
                  <textarea
                    ref={plainRef}
                    id="buzzy-c-content"
                    className="bz-in"
                    name="content"
                    rows={5}
                    value={plainContent}
                    onChange={(e) => setPlainContent(e.target.value)}
                  />
                )}
              </div>
              {showTurnstile && !attachmentStepEnabled ? (
                <div className="bz-form-field">
                  <span className="bz-l">Verification</span>
                  <BzTurnstile siteKey={captchaSiteKey} onToken={onCaptchaToken} resetKey={captchaNonce} />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <BzModalIntro>
                Optional: attach images, PDFs, Word files, or a short video — or leave this step empty and post with
                just what you wrote in step 1.
              </BzModalIntro>
              <div className="bz-form-field">
                <label className="bz-l" htmlFor="buzzy-c-attachments">
                  Attachments
                </label>
                <div id="buzzy-c-attachments">
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
        open={reportCommentId !== null}
        onClose={() => setReportCommentId(null)}
        apiBase={ctx.apiBase}
        apiKey={ctx.key}
        variant="comment"
        targetId={reportCommentId}
      />
      {serviceHost ? (
        <div className="bz-widget-footer" role="note">
          <span className="bz-widget-footer-inner" title={ctx.apiBase}>
            Service: {serviceHost}
          </span>
        </div>
      ) : null}
    </div>
  );
}
