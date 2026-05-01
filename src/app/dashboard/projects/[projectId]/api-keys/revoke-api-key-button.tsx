"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RevokeApiKeyButton({
  projectId,
  keyId,
  label,
}: {
  projectId: string;
  keyId: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onRevoke() {
    if (!window.confirm(`Revoke key “${label}”?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/projects/${projectId}/api-keys/${keyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await res.json()) as { success: boolean };
      if (!res.ok || !json.success) {
        window.alert("Could not revoke key.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onRevoke}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
    >
      {loading ? "…" : "Revoke"}
    </button>
  );
}
