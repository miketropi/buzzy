"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateApiKeyForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"live" | "test">("live");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRevealedKey(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/api-keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          environment,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { key?: string; notice?: string };
        error?: { message?: string };
      };
      if (!res.ok || !json.success || !json.data?.key) {
        setError(json.error?.message ?? "Could not create key.");
        return;
      }
      setRevealedKey(json.data.key);
      setName("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-medium text-slate-800 dark:text-slate-200">Create API key</h2>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {revealedKey ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Copy this secret now</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-xs text-amber-950 dark:text-amber-50">
            {revealedKey}
          </pre>
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="keyName" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Label
          </label>
          <input
            id="keyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Production"
            className="mt-1 w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
          />
        </div>
        <div>
          <label htmlFor="env" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Environment
          </label>
          <select
            id="env"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as "live" | "test")}
            className="mt-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value="live">live</option>
            <option value="test">test</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary shrink-0"
        >
          {loading ? "Creating…" : "Generate key"}
        </button>
      </form>
    </div>
  );
}
