"use client";

import { useCallback, useEffect, useState } from "react";

type ReportTarget =
  | {
      kind: "comment";
      id: string;
      excerpt: string;
      status: string;
      pageUrl: string;
      pageTitle: string;
      authorName: string;
    }
  | {
      kind: "review";
      id: string;
      excerpt: string;
      status: string;
      pageUrl: string;
      pageTitle: string;
      authorName: string;
    }
  | null;

type ReportRow = {
  id: string;
  status: string;
  reason: string;
  description: string | null;
  reporterIp: string | null;
  createdAt: string;
  target: ReportTarget;
};

function excerpt(text: string, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "—";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function ProjectReportsClient({
  projectId,
}: {
  projectId: string;
}) {
  const [status, setStatus] = useState<"pending" | "all" | "dismissed" | "actioned">("pending");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const u = new URL(`/api/internal/projects/${projectId}/reports`, window.location.origin);
      u.searchParams.set("status", status);
      const res = await fetch(u.toString(), { credentials: "include" });
      const json = (await res.json()) as { success?: boolean; data?: { reports?: ReportRow[] }; error?: { message?: string } };
      if (!res.ok || !json.success || !json.data?.reports) {
        throw new Error(json.error?.message || "Could not load reports.");
      }
      setReports(json.data.reports);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchReport(reportId: string, next: "dismissed" | "actioned") {
    setBusyId(reportId);
    setErr("");
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/reports/${reportId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (!json.success) {
        throw new Error(json.error?.message || "Update failed.");
      }
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  async function patchMessageStatus(kind: "comment" | "review", id: string, nextStatus: "spam") {
    const path =
      kind === "comment"
        ? `/api/internal/projects/${projectId}/comments/${id}`
        : `/api/internal/projects/${projectId}/reviews/${id}`;
    const res = await fetch(path, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
    if (!json.success) {
      throw new Error(json.error?.message || "Could not update content.");
    }
  }

  async function markSpamAndClose(row: ReportRow) {
    if (!row.target) {
      setErr("This report has no linked content.");
      return;
    }
    setBusyId(row.id);
    setErr("");
    try {
      await patchMessageStatus(row.target.kind, row.target.id, "spam");
      await patchReport(row.id, "actioned");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">User reports</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Visitors can report comments and reviews from the embed. Dismiss benign reports after review, or mark the
            content as spam — it disappears from public threads and stays in Messages under the Spam filter.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="reports-status">
            Queue
          </label>
          <select
            id="reports-status"
            className="rounded-lg border border-slate-200/90 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "pending" | "all" | "dismissed" | "actioned")
            }
          >
            <option value="pending">Pending</option>
            <option value="dismissed">Dismissed</option>
            <option value="actioned">Resolved</option>
            <option value="all">All statuses</option>
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

      {!loading && reports.length === 0 ? (
        <p className="rounded-xl border border-slate-200/80 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700">
          No reports for this filter.
        </p>
      ) : null}

      {!loading && reports.length > 0 ? (
        <ul className="space-y-3">
          {reports.map((row) => {
            const tgt = row.target;
            const busy = busyId === row.id;
            return (
              <li
                key={row.id}
                className="rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(row.createdAt).toLocaleString()}{" "}
                      <span className="font-mono text-[0.7rem]">· {row.status}</span>{" "}
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {row.reason}
                      </span>
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {tgt ? (
                        <>
                          {tgt.kind === "comment" ? "Comment" : "Review"} by {tgt.authorName}
                          {tgt.pageTitle ? (
                            <>
                              {" "}
                              · <span title={tgt.pageUrl}>{tgt.pageTitle}</span>
                            </>
                          ) : (
                            <>
                              {" "}
                              · <span className="font-mono text-xs">{tgt.pageUrl}</span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-red-700 dark:text-red-300">Missing target (removed?)</span>
                      )}
                    </p>
                    {tgt ? (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{excerpt(tgt.excerpt)}</p>
                    ) : null}
                    {row.description?.trim() ? (
                      <p className="mt-2 rounded-lg bg-slate-50 px-2 py-1.5 text-xs text-slate-700 dark:bg-slate-950/80 dark:text-slate-200">
                        Reporter note: {row.description}
                      </p>
                    ) : null}
                    {row.reporterIp ? (
                      <p className="mt-1 font-mono text-[0.65rem] text-slate-400">Reporter IP: {row.reporterIp}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {tgt && tgt.status !== "spam" ? (
                      <button
                        type="button"
                        disabled={busy}
                        className="rounded-md bg-amber-700 px-2 py-1 text-xs font-medium text-white hover:bg-amber-800 disabled:opacity-50"
                        onClick={() => void markSpamAndClose(row)}
                      >
                        Mark spam
                      </button>
                    ) : null}
                    {row.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800"
                          onClick={() => void patchReport(row.id, "dismissed")}
                        >
                          Dismiss
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
