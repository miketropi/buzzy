"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

type PageSizeOption = 20 | 50 | 100;

/** 0-based page indices; inserts "gap" for ellipsis between non-adjacent numbers. */
function getPaginationSlots(currentPage: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 1) return [];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const show = new Set<number>();
  show.add(0);
  show.add(totalPages - 1);
  for (let d = -2; d <= 2; d++) {
    const p = currentPage + d;
    if (p >= 0 && p < totalPages) show.add(p);
  }
  const sorted = Array.from(show).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("gap");
    out.push(sorted[i]);
  }
  return out;
}

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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<PageSizeOption>(20);
  const [total, setTotal] = useState(0);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const headerSelectRef = useRef<HTMLInputElement>(null);

  const pageRowIds = reports.map((r) => r.id);
  const allPageSelected = pageRowIds.length > 0 && pageRowIds.every((id) => selected.has(id));
  const somePageSelected = pageRowIds.some((id) => selected.has(id));

  useEffect(() => {
    const el = headerSelectRef.current;
    if (el) el.indeterminate = somePageSelected && !allPageSelected;
  }, [somePageSelected, allPageSelected]);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const u = new URL(`/api/internal/projects/${projectId}/reports`, window.location.origin);
      u.searchParams.set("status", status);
      u.searchParams.set("limit", String(pageSize));
      u.searchParams.set("offset", String(pageIndex * pageSize));
      const res = await fetch(u.toString(), { credentials: "include" });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { reports?: ReportRow[]; total?: number };
        error?: { message?: string };
      };
      if (!res.ok || !json.success || !json.data?.reports) {
        throw new Error(json.error?.message || "Could not load reports.");
      }
      setReports(json.data.reports);
      setTotal(typeof json.data.total === "number" ? json.data.total : 0);
      setSelected(new Set());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setReports([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [projectId, status, pageIndex, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPageIndex(0);
  }, [status]);

  useEffect(() => {
    setPageIndex(0);
  }, [pageSize]);

  useEffect(() => {
    const maxIdx = Math.max(0, Math.ceil(total / pageSize) - 1);
    if (pageIndex > maxIdx) setPageIndex(maxIdx);
  }, [total, pageSize, pageIndex]);

  const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / pageSize));
  const pageStart = total === 0 ? 0 : pageIndex * pageSize + 1;
  const pageEnd = Math.min(total, (pageIndex + 1) * pageSize);
  const paginationSlots = getPaginationSlots(pageIndex, totalPages);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function toggleSelectAllOnPage() {
    if (!reports.length) return;
    const ids = reports.map((r) => r.id);
    const all = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (all) {
        for (const id of ids) next.delete(id);
      } else {
        for (const id of ids) next.add(id);
      }
      return next;
    });
  }

  async function bulkSetStatus(next: "pending" | "dismissed" | "actioned") {
    if (selected.size === 0) return;
    setBulkBusy(true);
    setErr("");
    try {
      const ids = Array.from(selected);
      const res = await fetch(`/api/internal/projects/${projectId}/reports/bulk`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: next }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { updated?: number };
        error?: { message?: string };
      };
      if (!json.success) {
        setErr(json.error?.message || "Bulk update failed");
        return;
      }
      await load();
    } finally {
      setBulkBusy(false);
    }
  }

  async function patchReport(reportId: string, next: "pending" | "dismissed" | "actioned") {
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

      {selected.size > 0 && !loading ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-3 py-2.5 dark:bg-brand/10">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{selected.size} selected</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={bulkBusy}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800"
              onClick={() => void bulkSetStatus("dismissed")}
            >
              Dismiss
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              onClick={() => void bulkSetStatus("actioned")}
            >
              Resolve
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              className="rounded-md border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-950 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950/50"
              onClick={() => void bulkSetStatus("pending")}
            >
              Reopen
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:underline dark:text-slate-300"
              onClick={() => clearSelection()}
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

      {!loading ? (
        <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <p className="min-w-0">
            {total === 0 ? (
              <span>No reports match this filter.</span>
            ) : (
              <>
                Showing <span className="font-medium text-slate-800 dark:text-slate-200">{pageStart}</span>–
                <span className="font-medium text-slate-800 dark:text-slate-200">{pageEnd}</span> of{" "}
                <span className="font-medium text-slate-800 dark:text-slate-200">{total}</span>
              </>
            )}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
            <label className="flex items-center gap-2 text-xs">
              <span className="whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">Per page</span>
              <select
                id="bz-reports-page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as PageSizeOption)}
                className="rounded-lg border border-slate-200/90 bg-white px-2 py-1.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            {total > 0 && totalPages > 1 ? (
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  className="rounded-lg border border-slate-200/90 px-2.5 py-1 text-xs font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:enabled:hover:bg-slate-800/60"
                  disabled={pageIndex <= 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  Prev
                </button>
                {paginationSlots.map((slot, si) =>
                  slot === "gap" ? (
                    <span key={`gap-${si}`} className="select-none px-0.5 text-slate-400" aria-hidden>
                      …
                    </span>
                  ) : (
                    <button
                      key={slot}
                      type="button"
                      aria-label={`Page ${slot + 1}`}
                      aria-current={slot === pageIndex ? "page" : undefined}
                      className={
                        slot === pageIndex
                          ? "min-w-[2rem] rounded-lg bg-brand px-2 py-1 text-center text-xs font-semibold text-white ring-1 ring-brand/30"
                          : "min-w-[2rem] rounded-lg border border-slate-200/90 px-2 py-1 text-center text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      }
                      onClick={() => setPageIndex(slot)}
                    >
                      {slot + 1}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  aria-label="Next page"
                  className="rounded-lg border border-slate-200/90 px-2.5 py-1 text-xs font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:enabled:hover:bg-slate-800/60"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </button>
              </div>
            ) : null}
            {total > 0 && totalPages === 1 ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">Page 1 of 1</span>
            ) : null}
          </div>
        </div>
      ) : null}

      {!loading && reports.length === 0 ? (
        <p className="rounded-xl border border-slate-200/80 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700">
          No reports for this filter.
        </p>
      ) : null}

      {!loading && reports.length > 0 ? (
        <ul className="space-y-3">
          <li className="flex items-center gap-2 px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <input
              ref={headerSelectRef}
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-slate-300"
              checked={allPageSelected}
              onChange={() => toggleSelectAllOnPage()}
              disabled={!reports.length}
              title="Select all on this page"
              aria-label="Select all reports on this page"
            />
            <span>Select page</span>
          </li>
          {reports.map((row) => {
            const tgt = row.target;
            const busy = busyId === row.id;
            return (
              <li
                key={row.id}
                className="rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                    checked={selected.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    aria-label={`Select report ${row.id.slice(0, 8)}…`}
                  />
                  <div className="min-w-0 flex-1">
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
                            disabled={busy || bulkBusy}
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
                              disabled={busy || bulkBusy}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800"
                              onClick={() => void patchReport(row.id, "dismissed")}
                            >
                              Dismiss
                            </button>
                            <button
                              type="button"
                              disabled={busy || bulkBusy}
                              className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                              onClick={() => void patchReport(row.id, "actioned")}
                            >
                              Resolve
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={busy || bulkBusy}
                            className="rounded-md border border-amber-300 px-2 py-1 text-xs font-medium text-amber-950 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950/50"
                            onClick={() => void patchReport(row.id, "pending")}
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
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
