"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WIDGET_MODE_PREVIEW, normalizeWidgetMode } from "@/lib/widget-mode-ux";

const widgetModes = ["comment", "review", "rating"] as const;

export function ProjectSettingsForm({
  projectId,
  initialName,
  initialWidgetMode,
  initialDomainsText,
  initialAutoApprove,
  initialEnableAttachments,
  initialAllowAnonymous,
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

      const resBehavior = await fetch(`/api/internal/projects/${projectId}/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requireApproval: !autoApprove,
          enableAttachments,
          allowAnonymous,
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
          One per line or comma-separated. Wildcards like *.example.com are supported. Save this form for behavior;
          appearance has its own save below.
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
