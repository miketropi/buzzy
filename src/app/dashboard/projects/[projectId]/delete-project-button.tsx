"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm(
      `Delete project “${projectName}”? This cannot be undone.`,
    );
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await res.json()) as { success: boolean };
      if (!res.ok || !json.success) {
        window.alert("Could not delete project.");
        return;
      }
      router.push("/dashboard/projects");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/40"
    >
      {loading ? "Deleting…" : "Delete project"}
    </button>
  );
}
