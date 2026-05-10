"use client";

import { useCallback, useEffect, useState } from "react";

type AppealRow = {
  id: string;
  comment_id: string | null;
  review_id: string | null;
  email: string | null;
  message: string;
  status: string;
  created_at: string;
};

export function ProjectAppealsClient({ projectId }: { projectId: string }) {
  const [rows, setRows] = useState<AppealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch(`/api/internal/projects/${projectId}/appeals`, { credentials: "include" });
    const j = (await res.json()) as { success?: boolean; data?: { appeals?: AppealRow[] }; error?: { message?: string } };
    if (!res.ok || !j.success) {
      setErr(j.error?.message ?? "Failed to load appeals.");
      setRows([]);
    } else {
      setRows(j.data?.appeals ?? []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: AppealRow["status"]) {
    setBusyId(id);
    setErr(null);
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/appeals/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const j = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (!res.ok || !j.success) {
        setErr(j.error?.message ?? "Update failed.");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="dash-panel overflow-hidden p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[var(--foreground)]">Appeals</h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Visitors can submit appeals against moderation via the public API. Use this list to triage outcomes; actions
        are recorded in the moderation audit log.
      </p>
      {err ? <p className="mt-4 text-sm text-red-600 dark:text-red-300">{err}</p> : null}
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">No appeals yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">Target</th>
                <th className="py-2 pr-4 font-medium">Message</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-[var(--border)] align-top">
                  <td className="py-3 pr-4 text-[var(--muted)] whitespace-nowrap">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {a.comment_id ? `comment ${a.comment_id.slice(0, 8)}…` : null}
                    {a.review_id ? `review ${a.review_id.slice(0, 8)}…` : null}
                  </td>
                  <td className="py-3 pr-4 max-w-md">
                    <p className="line-clamp-3 text-[var(--foreground)]">{a.message}</p>
                    {a.email ? <p className="mt-1 text-xs text-[var(--muted)]">{a.email}</p> : null}
                  </td>
                  <td className="py-3 pr-4">{a.status}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["reviewed", "dismissed", "actioned", "open"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={busyId === a.id || a.status === s}
                          className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                          onClick={() => void setStatus(a.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
