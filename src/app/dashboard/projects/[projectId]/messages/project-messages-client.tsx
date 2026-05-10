"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { StaffReplyEditor, staffReplyInitialHtml, type StaffReplyEditorRef } from "@/components/staff-reply-editor";

type StatusFilter = "all" | "pending" | "approved" | "spam" | "deleted";

type InboxCommenter = {
  name: string;
  email: string | null;
  externalId: string | null;
  provider: string;
  avatar: string | null;
};

type InboxComment = {
  id: string;
  status: string;
  content: string;
  htmlContent: string | null;
  attachments: unknown;
  submitterIp: string | null;
  parentId: string | null;
  depth: number;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  page: { url: string; title: string | null };
  commenter: InboxCommenter;
};

type InboxReview = {
  id: string;
  status: string;
  rating: number;
  categoryRatings: unknown;
  title: string | null;
  content: string | null;
  htmlContent: string | null;
  staffReplyContent: string | null;
  staffReplyHtml: string | null;
  staffRepliedAt: string | null;
  attachments: unknown;
  submitterIp: string | null;
  isVerified: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  isPinned: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  page: { url: string; title: string | null };
  commenter: InboxCommenter;
};

function excerpt(text: string | null, max = 140) {
  if (!text?.trim()) return "—";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,8.5rem)_1fr] gap-x-3 gap-y-1 border-b border-slate-100 py-2.5 text-sm last:border-0 dark:border-slate-800">
      <dt className="shrink-0 font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 break-words text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

function JsonOrNone({ value }: { value: unknown }) {
  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-slate-500">—</span>;
  }
  return (
    <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function FeedbackModal({
  variant,
  title,
  message,
  onClose,
}: {
  variant: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const bar =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
      : "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Dismiss" onClick={onClose} />
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl border p-5 shadow-xl dark:shadow-black/40 ${bar}`}
      >
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm opacity-90">{message}</p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function staffReplySeedLooksEmpty(html: string): boolean {
  const compact = html.replace(/\s/g, "");
  return !compact || compact === "<p></p>" || compact === "<p><br></p>";
}

function StaffCommentReplyModal({
  parent,
  busy,
  error,
  contentVersion,
  initialHtml,
  onSubmit,
  onClose,
}: {
  parent: InboxComment;
  busy: boolean;
  error: string;
  contentVersion: number;
  initialHtml: string;
  onSubmit: (payload: { text: string; html: string }) => void | Promise<void>;
  onClose: () => void;
}) {
  const editorRef = useRef<StaffReplyEditorRef>(null);
  const [editorEmpty, setEditorEmpty] = useState(() => staffReplySeedLooksEmpty(initialHtml));

  useEffect(() => {
    setEditorEmpty(staffReplySeedLooksEmpty(initialHtml));
  }, [contentVersion, initialHtml]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function post() {
    const v = editorRef.current?.getValues();
    if (!v || v.isEmpty) return;
    void onSubmit({ text: v.text, html: v.html });
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="bz-reply-comment-title">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close dialog" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h3 id="bz-reply-comment-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Reply to comment
          </h3>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div className="rounded-lg border border-slate-200/90 bg-slate-50/80 p-3 text-xs dark:border-slate-600 dark:bg-slate-800/50">
            <p className="font-medium text-slate-700 dark:text-slate-200">
              Replying to {parent.commenter.name}
              {parent.commenter.provider === "staff" ? (
                <span className="ml-1 rounded bg-violet-100 px-1 font-semibold uppercase text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                  staff
                </span>
              ) : null}
            </p>
            <p className="mt-1 line-clamp-4 text-slate-600 dark:text-slate-400">{excerpt(parent.content, 400)}</p>
            <p className="mt-1 text-slate-500">
              {parent.page.title || parent.page.url} · {parent.status}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rich text is sanitized on save (bold, lists, links, quotes). Staff replies post as approved immediately.
          </p>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Message</label>
          <StaffReplyEditor
            ref={editorRef}
            contentVersion={contentVersion}
            initialHtml={initialHtml}
            disabled={busy}
            placeholder="Write your reply…"
            onModEnter={post}
            onDocumentChange={({ isEmpty }) => setEditorEmpty(isEmpty)}
          />
          {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          <button
            type="button"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            disabled={busy || editorEmpty}
            onClick={() => post()}
          >
            {busy ? "Posting…" : "Post reply"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <span className="self-center text-xs text-slate-500">⌘/Ctrl + Enter to send</span>
        </div>
      </div>
    </div>
  );
}

function StaffReviewReplyModal({
  review,
  busy,
  error,
  contentVersion,
  initialHtml,
  onSubmit,
  onClose,
}: {
  review: InboxReview;
  busy: boolean;
  error: string;
  contentVersion: number;
  initialHtml: string;
  onSubmit: (payload: { text: string; html: string }) => void | Promise<void>;
  onClose: () => void;
}) {
  const editorRef = useRef<StaffReplyEditorRef>(null);
  const [editorEmpty, setEditorEmpty] = useState(() => staffReplySeedLooksEmpty(initialHtml));

  useEffect(() => {
    setEditorEmpty(staffReplySeedLooksEmpty(initialHtml));
  }, [contentVersion, initialHtml]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasExisting = !!(review.staffReplyContent?.trim() || review.staffReplyHtml?.trim());

  function save() {
    const v = editorRef.current?.getValues();
    if (!v || v.isEmpty) return;
    void onSubmit({ text: v.text, html: v.html });
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="bz-reply-review-title">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close dialog" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h3 id="bz-reply-review-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {hasExisting ? "Edit official reply" : "Official reply to review"}
          </h3>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div className="rounded-lg border border-slate-200/90 bg-slate-50/80 p-3 text-xs dark:border-slate-600 dark:bg-slate-800/50">
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {review.commenter.name} · {review.rating} ★
            </p>
            <p className="mt-1 line-clamp-3 text-slate-600 dark:text-slate-400">{excerpt(review.content || review.title, 320)}</p>
            <p className="mt-1 text-slate-500">{review.page.title || review.page.url}</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Shown publicly below the review on the widget. Rich text is sanitized on save.
          </p>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Message</label>
          <StaffReplyEditor
            ref={editorRef}
            contentVersion={contentVersion}
            initialHtml={initialHtml}
            disabled={busy}
            placeholder="Thank them or add context…"
            onModEnter={save}
            onDocumentChange={({ isEmpty }) => setEditorEmpty(isEmpty)}
          />
          {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          <button
            type="button"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            disabled={busy || editorEmpty}
            onClick={() => save()}
          >
            {busy ? "Saving…" : "Save reply"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <span className="self-center text-xs text-slate-500">⌘/Ctrl + Enter to save</span>
        </div>
      </div>
    </div>
  );
}

function MessageDetailModal({
  kind,
  comment,
  review,
  onClose,
  onReplyToComment,
  onReplyToReview,
}: {
  kind: "comment" | "review";
  comment: InboxComment | null;
  review: InboxReview | null;
  onClose: () => void;
  onReplyToComment?: (c: InboxComment) => void;
  onReplyToReview?: (r: InboxReview) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const c = kind === "comment" ? comment : null;
  const r = kind === "review" ? review : null;
  if (!c && !r) return null;

  const title = c ? "Comment details" : "Review details";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close dialog" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {c ? (
            <dl>
              <DetailRow label="ID">{c.id}</DetailRow>
              <DetailRow label="Status">{c.status}</DetailRow>
              <DetailRow label="Created">{new Date(c.createdAt).toLocaleString()}</DetailRow>
              <DetailRow label="Updated">{new Date(c.updatedAt).toLocaleString()}</DetailRow>
              {c.editedAt ? (
                <DetailRow label="Edited">{new Date(c.editedAt).toLocaleString()}</DetailRow>
              ) : null}
              <DetailRow label="Page URL">
                <a href={c.page.url} className="text-brand underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                  {c.page.url}
                </a>
              </DetailRow>
              {c.page.title ? <DetailRow label="Page title">{c.page.title}</DetailRow> : null}
              <DetailRow label="Thread">{c.parentId ? `Reply (parent ${c.parentId})` : "Top-level"} · depth {c.depth}</DetailRow>
              <DetailRow label="Votes">
                ↑ {c.upvotes} · ↓ {c.downvotes}
              </DetailRow>
              <DetailRow label="Pinned">{c.isPinned ? "Yes" : "No"}</DetailRow>
              <DetailRow label="Submitter IP">{c.submitterIp ?? "—"}</DetailRow>
              <DetailRow label="Author">{c.commenter.name}</DetailRow>
              <DetailRow label="Provider">{c.commenter.provider}</DetailRow>
              <DetailRow label="Email">{c.commenter.email ?? "—"}</DetailRow>
              <DetailRow label="External ID">{c.commenter.externalId ?? "—"}</DetailRow>
              <DetailRow label="Avatar URL">{c.commenter.avatar ?? "—"}</DetailRow>
              <DetailRow label="Plain text">
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-950">
                  {c.content}
                </pre>
              </DetailRow>
              <DetailRow label="HTML">
                {c.htmlContent?.trim() ? (
                  <div className="space-y-2">
                    <div
                      className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                      dangerouslySetInnerHTML={{ __html: c.htmlContent }}
                    />
                    <pre className="max-h-32 overflow-auto rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-950">
                      {c.htmlContent}
                    </pre>
                  </div>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Attachments">
                <JsonOrNone value={c.attachments} />
              </DetailRow>
            </dl>
          ) : r ? (
            <dl>
              <DetailRow label="ID">{r.id}</DetailRow>
              <DetailRow label="Status">{r.status}</DetailRow>
              <DetailRow label="Rating">{r.rating}</DetailRow>
              <DetailRow label="Verified">{r.isVerified ? "Yes" : "No"}</DetailRow>
              <DetailRow label="Created">{new Date(r.createdAt).toLocaleString()}</DetailRow>
              <DetailRow label="Updated">{new Date(r.updatedAt).toLocaleString()}</DetailRow>
              {r.editedAt ? (
                <DetailRow label="Edited">{new Date(r.editedAt).toLocaleString()}</DetailRow>
              ) : null}
              <DetailRow label="Page URL">
                <a href={r.page.url} className="text-brand underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                  {r.page.url}
                </a>
              </DetailRow>
              {r.page.title ? <DetailRow label="Page title">{r.page.title}</DetailRow> : null}
              <DetailRow label="Submitter IP">{r.submitterIp ?? "—"}</DetailRow>
              <DetailRow label="Helpful / not">
                {r.helpfulCount} / {r.unhelpfulCount}
              </DetailRow>
              <DetailRow label="Pinned">{r.isPinned ? "Yes" : "No"}</DetailRow>
              <DetailRow label="Author">{r.commenter.name}</DetailRow>
              <DetailRow label="Provider">{r.commenter.provider}</DetailRow>
              <DetailRow label="Email">{r.commenter.email ?? "—"}</DetailRow>
              <DetailRow label="External ID">{r.commenter.externalId ?? "—"}</DetailRow>
              {r.title ? <DetailRow label="Title">{r.title}</DetailRow> : null}
              <DetailRow label="Plain text">
                {r.content?.trim() ? (
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-950">
                    {r.content}
                  </pre>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="HTML">
                {r.htmlContent?.trim() ? (
                  <div className="space-y-2">
                    <div
                      className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                      dangerouslySetInnerHTML={{ __html: r.htmlContent }}
                    />
                    <pre className="max-h-32 overflow-auto rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-950">
                      {r.htmlContent}
                    </pre>
                  </div>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Category ratings">
                <JsonOrNone value={r.categoryRatings} />
              </DetailRow>
              <DetailRow label="Attachments">
                <JsonOrNone value={r.attachments} />
              </DetailRow>
              <DetailRow label="Staff reply (plain)">
                {r.staffReplyContent?.trim() ? (
                  <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-violet-50 p-2 text-xs dark:bg-violet-950/40">
                    {r.staffReplyContent}
                  </pre>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Staff reply (HTML)">
                {r.staffReplyHtml?.trim() ? (
                  <pre className="max-h-32 overflow-auto rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-950">
                    {r.staffReplyHtml}
                  </pre>
                ) : (
                  "—"
                )}
              </DetailRow>
              {r.staffRepliedAt ? (
                <DetailRow label="Staff replied at">{new Date(r.staffRepliedAt).toLocaleString()}</DetailRow>
              ) : null}
            </dl>
          ) : null}
        </div>
        {c && onReplyToComment && c.status !== "deleted" ? (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
              onClick={() => {
                onClose();
                onReplyToComment(c);
              }}
            >
              Reply in thread
            </button>
          </div>
        ) : null}
        {r && onReplyToReview && r.status !== "deleted" ? (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
              onClick={() => {
                onClose();
                onReplyToReview(r);
              }}
            >
              {r.staffReplyContent?.trim() || r.staffReplyHtml?.trim() ? "Edit official reply" : "Add official reply"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectMessagesClient({
  projectId,
  widgetMode,
}: {
  projectId: string;
  widgetMode: string;
}) {
  const isCommentMode = widgetMode === "comment";
  const isReviewMode = widgetMode === "review" || widgetMode === "rating";

  const [status, setStatus] = useState<StatusFilter>("pending");
  const [comments, setComments] = useState<InboxComment[] | null>(null);
  const [reviews, setReviews] = useState<InboxReview[] | null>(null);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [reviewsDisabled, setReviewsDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [commentReplyTo, setCommentReplyTo] = useState<InboxComment | null>(null);
  const [commentReplyBusy, setCommentReplyBusy] = useState(false);
  const [commentReplyModalErr, setCommentReplyModalErr] = useState("");
  const [reviewReplyTo, setReviewReplyTo] = useState<InboxReview | null>(null);
  const [reviewReplyBusy, setReviewReplyBusy] = useState(false);
  const [reviewReplyModalErr, setReviewReplyModalErr] = useState("");
  const [replySeedHtml, setReplySeedHtml] = useState("<p></p>");
  const [replyContentVersion, setReplyContentVersion] = useState(0);
  const [feedback, setFeedback] = useState<{ variant: "success" | "error"; title: string; message: string } | null>(null);
  const [detail, setDetail] = useState<
    | { kind: "comment"; item: InboxComment }
    | { kind: "review"; item: InboxReview }
    | null
  >(null);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      if (isCommentMode) {
        const u = new URL(`/api/internal/projects/${projectId}/comments`, window.location.origin);
        u.searchParams.set("status", status);
        const res = await fetch(u.toString(), { credentials: "include" });
        const json = (await res.json()) as {
          success?: boolean;
          error?: { message?: string };
          data?: { comments?: InboxComment[]; commentsDisabled?: boolean };
        };
        if (!json.success || !json.data) {
          throw new Error(json.error?.message || `Request failed (${res.status})`);
        }
        setCommentsDisabled(!!json.data.commentsDisabled);
        setComments(json.data.commentsDisabled ? [] : json.data.comments ?? []);
        setReviews(null);
      } else {
        const u = new URL(`/api/internal/projects/${projectId}/reviews`, window.location.origin);
        u.searchParams.set("status", status);
        const res = await fetch(u.toString(), { credentials: "include" });
        const json = (await res.json()) as {
          success?: boolean;
          error?: { message?: string };
          data?: { reviews?: InboxReview[]; reviewsDisabled?: boolean };
        };
        if (!json.success || !json.data) {
          throw new Error(json.error?.message || `Request failed (${res.status})`);
        }
        setReviewsDisabled(!!json.data.reviewsDisabled);
        setReviews(json.data.reviewsDisabled ? [] : json.data.reviews ?? []);
        setComments(null);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setComments([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, status, isCommentMode]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchComment(id: string, next: Exclude<StatusFilter, "all">) {
    setErr("");
    const res = await fetch(`/api/internal/projects/${projectId}/comments/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
    if (!json.success) {
      setErr(json.error?.message || "Update failed");
      return;
    }
    await load();
  }

  async function patchReview(id: string, next: Exclude<StatusFilter, "all">) {
    setErr("");
    const res = await fetch(`/api/internal/projects/${projectId}/reviews/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
    if (!json.success) {
      setErr(json.error?.message || "Update failed");
      return;
    }
    await load();
  }

  async function saveReviewStaffReply(payload: { text: string; html: string }) {
    if (!reviewReplyTo) return;
    const plain = payload.text.trim();
    let html = payload.html.trim();
    if (staffReplySeedLooksEmpty(html)) html = "";
    if (!plain && !html) return;
    setReviewReplyBusy(true);
    setReviewReplyModalErr("");
    setErr("");
    try {
      const body: { staffReplyContent?: string; staffReplyHtml?: string } = {};
      if (plain) body.staffReplyContent = plain;
      if (html) body.staffReplyHtml = html;
      const res = await fetch(`/api/internal/projects/${projectId}/reviews/${reviewReplyTo.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (!json.success) {
        const msg = json.error?.message || "Could not save reply";
        setReviewReplyModalErr(msg);
        return;
      }
      setReviewReplyTo(null);
      setReplySeedHtml("<p></p>");
      await load();
      setFeedback({
        variant: "success",
        title: "Reply saved",
        message: "The official reply is updated and will show on the widget.",
      });
    } finally {
      setReviewReplyBusy(false);
    }
  }

  async function clearReviewStaffReply(reviewId: string) {
    setErr("");
    const res = await fetch(`/api/internal/projects/${projectId}/reviews/${reviewId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearStaffReply: true }),
    });
    const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
    if (!json.success) {
      setErr(json.error?.message || "Could not clear reply");
      return;
    }
    if (reviewReplyTo?.id === reviewId) {
      setReviewReplyTo(null);
      setReplySeedHtml("<p></p>");
      setReviewReplyModalErr("");
    }
    await load();
    setFeedback({
      variant: "success",
      title: "Reply removed",
      message: "The official reply was cleared from this review.",
    });
  }

  async function submitCommentReply(payload: { text: string; html: string }) {
    if (!commentReplyTo) return;
    const plain = payload.text.trim();
    let html = payload.html.trim();
    if (staffReplySeedLooksEmpty(html)) html = "";
    if (!plain && !html) return;
    setCommentReplyBusy(true);
    setCommentReplyModalErr("");
    setErr("");
    try {
      const body: { parent_id: string; content?: string; html?: string } = {
        parent_id: commentReplyTo.id,
      };
      if (plain) body.content = plain;
      if (html) body.html = html;
      const res = await fetch(`/api/internal/projects/${projectId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (!json.success) {
        const msg = json.error?.message || "Reply failed";
        setCommentReplyModalErr(msg);
        return;
      }
      setCommentReplyTo(null);
      setReplySeedHtml("<p></p>");
      await load();
      setFeedback({
        variant: "success",
        title: "Reply posted",
        message: "Your staff reply was published to the thread as approved.",
      });
    } finally {
      setCommentReplyBusy(false);
    }
  }

  function openCommentReply(c: InboxComment) {
    setCommentReplyModalErr("");
    setCommentReplyTo(c);
    setReplySeedHtml("<p></p>");
    setReplyContentVersion((v) => v + 1);
  }

  function openReviewReply(r: InboxReview) {
    setReviewReplyModalErr("");
    setReviewReplyTo(r);
    setReplySeedHtml(staffReplyInitialHtml(r.staffReplyContent, r.staffReplyHtml));
    setReplyContentVersion((v) => v + 1);
  }

  return (
    <div className="card-surface space-y-6 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Inbox</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Approve or hide guest submissions. Reply to <strong>comments</strong> (thread) or <strong>reviews</strong>{" "}
            (official response shown on the widget).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="bz-status">
            Status
          </label>
          <select
            id="bz-status"
            className="rounded-lg border border-slate-200/90 bg-white px-2 py-1.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="spam">Spam</option>
            <option value="deleted">Deleted / hidden</option>
            <option value="all">All</option>
          </select>
          <button
            type="button"
            className="rounded-lg border border-slate-200/90 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
            onClick={() => void load()}
          >
            Refresh
          </button>
        </div>
      </div>

      {err ? (
        <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

      {!loading && isCommentMode && commentsDisabled ? (
        <p className="text-sm text-slate-500">Comments inbox is available when the project widget mode is set to comment.</p>
      ) : null}

      {!loading && isReviewMode && reviewsDisabled ? (
        <p className="text-sm text-slate-500">Reviews inbox is available when the project widget mode is review or rating.</p>
      ) : null}

      {!loading && isCommentMode && !commentsDisabled && comments ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
          <table className="min-w-[640px] w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200/90 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Preview</th>
                <th className="px-3 py-2">Details</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No comments for this filter.
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c.id} className="bg-white/80 dark:bg-slate-900/30">
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                    <td className="max-w-[12rem] px-3 py-2">
                      <span className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300" title={c.page.url}>
                        {c.page.title || c.page.url}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-800 dark:text-slate-100">
                      {c.commenter.name}
                      {c.commenter.provider === "staff" ? (
                        <span className="ml-1 rounded bg-violet-100 px-1 text-[0.65rem] font-semibold uppercase text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                          staff
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{c.status}</td>
                    <td className="max-w-[14rem] px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                      {excerpt(c.content)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setDetail({ kind: "comment", item: c })}
                      >
                        View
                      </button>
                    </td>
                    <td className="space-y-1 px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {c.status !== "approved" ? (
                          <button
                            type="button"
                            className="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-emerald-700"
                            onClick={() => void patchComment(c.id, "approved")}
                          >
                            Approve
                          </button>
                        ) : null}
                        {c.status !== "spam" && c.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md bg-amber-700 px-2 py-0.5 text-xs font-medium text-white hover:bg-amber-800"
                            onClick={() => void patchComment(c.id, "spam")}
                          >
                            Spam
                          </button>
                        ) : null}
                        {c.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => void patchComment(c.id, "deleted")}
                          >
                            Hide
                          </button>
                        ) : null}
                        {c.status !== "pending" && c.status !== "deleted" && c.status !== "spam" ? (
                          <button
                            type="button"
                            className="rounded-md border border-amber-300 px-2 py-0.5 text-xs font-medium text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950/50"
                            onClick={() => void patchComment(c.id, "pending")}
                          >
                            Mark pending
                          </button>
                        ) : null}
                        {c.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md border border-violet-300 px-2 py-0.5 text-xs font-medium text-violet-900 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-100 dark:hover:bg-violet-950/50"
                            onClick={() => openCommentReply(c)}
                          >
                            Reply
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && isReviewMode && !reviewsDisabled && reviews ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
          <table className="min-w-[640px] w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200/90 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Preview</th>
                <th className="px-3 py-2">Details</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                    No reviews for this filter.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="bg-white/80 dark:bg-slate-900/30">
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="max-w-[12rem] px-3 py-2">
                      <span className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300" title={r.page.url}>
                        {r.page.title || r.page.url}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-amber-700 dark:text-amber-300">{r.rating} ★</td>
                    <td className="px-3 py-2 text-slate-800 dark:text-slate-100">{r.commenter.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.status}</td>
                    <td className="max-w-[14rem] px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="line-clamp-2">{excerpt(r.content || r.title)}</span>
                      {r.staffReplyContent?.trim() || r.staffReplyHtml?.trim() ? (
                        <span className="mt-1 block text-[0.65rem] font-medium text-violet-700 dark:text-violet-300">
                          Has official reply
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setDetail({ kind: "review", item: r })}
                      >
                        View
                      </button>
                    </td>
                    <td className="space-y-1 px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {r.status !== "approved" ? (
                          <button
                            type="button"
                            className="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-emerald-700"
                            onClick={() => void patchReview(r.id, "approved")}
                          >
                            Approve
                          </button>
                        ) : null}
                        {r.status !== "spam" && r.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md bg-amber-700 px-2 py-0.5 text-xs font-medium text-white hover:bg-amber-800"
                            onClick={() => void patchReview(r.id, "spam")}
                          >
                            Spam
                          </button>
                        ) : null}
                        {r.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => void patchReview(r.id, "deleted")}
                          >
                            Hide
                          </button>
                        ) : null}
                        {r.status !== "pending" && r.status !== "deleted" && r.status !== "spam" ? (
                          <button
                            type="button"
                            className="rounded-md border border-amber-300 px-2 py-0.5 text-xs font-medium text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950/50"
                            onClick={() => void patchReview(r.id, "pending")}
                          >
                            Mark pending
                          </button>
                        ) : null}
                        {r.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md border border-violet-300 px-2 py-0.5 text-xs font-medium text-violet-900 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-100 dark:hover:bg-violet-950/50"
                            onClick={() => openReviewReply(r)}
                          >
                            {r.staffReplyContent?.trim() || r.staffReplyHtml?.trim() ? "Edit reply" : "Reply"}
                          </button>
                        ) : null}
                        {r.staffReplyContent?.trim() || r.staffReplyHtml?.trim() ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-400 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => void clearReviewStaffReply(r.id)}
                          >
                            Clear reply
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {detail ? (
        <MessageDetailModal
          kind={detail.kind}
          comment={detail.kind === "comment" ? detail.item : null}
          review={detail.kind === "review" ? detail.item : null}
          onClose={() => setDetail(null)}
          onReplyToComment={isCommentMode ? (c) => openCommentReply(c) : undefined}
          onReplyToReview={isReviewMode ? (r) => openReviewReply(r) : undefined}
        />
      ) : null}

      {commentReplyTo ? (
        <StaffCommentReplyModal
          parent={commentReplyTo}
          contentVersion={replyContentVersion}
          initialHtml={replySeedHtml}
          busy={commentReplyBusy}
          error={commentReplyModalErr}
          onSubmit={(p) => void submitCommentReply(p)}
          onClose={() => {
            setCommentReplyTo(null);
            setReplySeedHtml("<p></p>");
            setCommentReplyModalErr("");
          }}
        />
      ) : null}

      {reviewReplyTo ? (
        <StaffReviewReplyModal
          review={reviewReplyTo}
          contentVersion={replyContentVersion}
          initialHtml={replySeedHtml}
          busy={reviewReplyBusy}
          error={reviewReplyModalErr}
          onSubmit={(p) => void saveReviewStaffReply(p)}
          onClose={() => {
            setReviewReplyTo(null);
            setReplySeedHtml("<p></p>");
            setReviewReplyModalErr("");
          }}
        />
      ) : null}

      {feedback ? (
        <FeedbackModal
          variant={feedback.variant}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      ) : null}
    </div>
  );
}
