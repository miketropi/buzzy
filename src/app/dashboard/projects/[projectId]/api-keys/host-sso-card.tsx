"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function HostSsoCard({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/host-sso-secret`, {
        credentials: "include",
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { configured?: boolean };
        error?: { message?: string };
      };
      if (res.ok && json.success && json.data) {
        setConfigured(!!json.data.configured);
      } else {
        setConfigured(false);
      }
    } catch {
      setConfigured(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onGenerate() {
    setError(null);
    setRevealedSecret(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/host-sso-secret`, {
        method: "POST",
        credentials: "include",
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { secret?: string; notice?: string };
        error?: { message?: string };
      };
      if (!res.ok || !json.success || !json.data?.secret) {
        setError(json.error?.message ?? "Could not generate secret.");
        return;
      }
      setRevealedSecret(json.data.secret);
      setConfigured(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-medium text-slate-800 dark:text-slate-200">Host SSO (embed identity)</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Sign identities on <strong className="font-medium text-slate-800 dark:text-slate-200">your server</strong> with
        HMAC-SHA256 using this secret. The embed sends the compact token as{" "}
        <code className="rounded bg-slate-100 px-1 text-xs dark:bg-zinc-800">X-Buzzy-Host-Identity</code>. Claims bind to
        this project via <code className="rounded bg-slate-100 px-1 text-xs dark:bg-zinc-800">pid</code> in the payload.
        See <code className="text-xs">PROJECT.md</code> for the payload shape and a signing example.
      </p>
      {configured === null ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Status:{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {configured ? "Secret configured (value hidden)" : "Not configured"}
          </span>
        </p>
      )}
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {revealedSecret ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Copy this secret now</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-xs text-amber-950 dark:text-amber-50">
            {revealedSecret}
          </pre>
        </div>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void onGenerate()}
        className="btn-primary text-sm"
      >
        {loading ? "Working…" : configured ? "Rotate Host SSO secret" : "Generate Host SSO secret"}
      </button>
    </div>
  );
}
