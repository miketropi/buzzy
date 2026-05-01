"use client";

import { useCallback, useEffect, useState } from "react";

type StatusFilter = "all" | "pending" | "approved" | "deleted";

type InboxComment = {
  id: string;
  status: string;
  content: string;
  htmlContent: string | null;
  parentId: string | null;
  depth: number;
  createdAt: string;
  page: { url: string; title: string | null };
  commenter: { name: string; provider: string };
};

type InboxReview = {
  id: string;
  status: string;
  rating: number;
  title: string | null;
  content: string | null;
  htmlContent: string | null;
  staffReplyContent: string | null;
  staffReplyHtml: string | null;
  staffRepliedAt: string | null;
  createdAt: string;
  page: { url: string; title: string | null };
  commenter: { name: string; provider: string };
};

function excerpt(text: string | null, max = 140) {
  if (!text?.trim()) return "—";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
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
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [reviewReplyId, setReviewReplyId] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState("");
  const [reviewReplyBusy, setReviewReplyBusy] = useState(false);

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

  async function patchComment(id: string, next: StatusFilter) {
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

  async function patchReview(id: string, next: StatusFilter) {
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

  async function saveReviewStaffReply() {
    if (!reviewReplyId || !reviewReplyText.trim()) return;
    setReviewReplyBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/reviews/${reviewReplyId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffReplyContent: reviewReplyText.trim() }),
      });
      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (!json.success) {
        setErr(json.error?.message || "Could not save reply");
        return;
      }
      setReviewReplyId(null);
      setReviewReplyText("");
      await load();
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
    if (reviewReplyId === reviewId) {
      setReviewReplyId(null);
      setReviewReplyText("");
    }
    await load();
  }

  async function submitReply() {
    if (!replyParentId || !replyText.trim()) return;
    setReplyBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: replyParentId, content: replyText.trim() }),
      });
      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (!json.success) {
        setErr(json.error?.message || "Reply failed");
        return;
      }
      setReplyParentId(null);
      setReplyText("");
      await load();
    } finally {
      setReplyBusy(false);
    }
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
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
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
                        {c.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => void patchComment(c.id, "deleted")}
                          >
                            Hide
                          </button>
                        ) : null}
                        {c.status !== "pending" && c.status !== "deleted" ? (
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
                            onClick={() => {
                              setReplyParentId(c.id);
                              setReplyText("");
                            }}
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

      {replyParentId ? (
        <div className="rounded-xl border border-violet-200/90 bg-violet-50/40 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
          <p className="text-xs font-medium text-violet-900 dark:text-violet-200">Official reply (approved immediately)</p>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-200/90 bg-white p-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            rows={4}
            value={replyText}
            placeholder="Write your reply…"
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              disabled={replyBusy || !replyText.trim()}
              onClick={() => void submitReply()}
            >
              {replyBusy ? "Posting…" : "Post reply"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
              onClick={() => {
                setReplyParentId(null);
                setReplyText("");
              }}
            >
              Cancel
            </button>
          </div>
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
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
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
                        {r.status !== "deleted" ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => void patchReview(r.id, "deleted")}
                          >
                            Hide
                          </button>
                        ) : null}
                        {r.status !== "pending" && r.status !== "deleted" ? (
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
                            onClick={() => {
                              setReviewReplyId(r.id);
                              setReviewReplyText(r.staffReplyContent?.trim() || "");
                            }}
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

      {isReviewMode && reviewReplyId ? (
        <div className="rounded-xl border border-violet-200/90 bg-violet-50/40 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
          <p className="text-xs font-medium text-violet-900 dark:text-violet-200">
            Official reply to review (plain text — shown on the public widget below the review)
          </p>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-200/90 bg-white p-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            rows={4}
            value={reviewReplyText}
            placeholder="Thank them or add context…"
            onChange={(e) => setReviewReplyText(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              disabled={reviewReplyBusy || !reviewReplyText.trim()}
              onClick={() => void saveReviewStaffReply()}
            >
              {reviewReplyBusy ? "Saving…" : "Save reply"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
              onClick={() => {
                setReviewReplyId(null);
                setReviewReplyText("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
