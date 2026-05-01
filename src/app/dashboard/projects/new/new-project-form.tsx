"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/internal/projects", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug.trim().toLowerCase(),
          allowedDomains: [],
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { id: string };
        error?: { message?: string };
      };
      if (!res.ok || !json.success || !json.data?.id) {
        setError(json.error?.message ?? "Could not create project.");
        return;
      }
      router.push(`/dashboard/projects/${json.data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface space-y-5 p-6 sm:p-8">
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Display name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My marketing site"
          className="input-buzzy !mt-2 bg-white dark:bg-slate-950"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Slug
        </label>
        <input
          id="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Lowercase letters, numbers, and hyphens"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-site"
          className="input-buzzy !mt-2 bg-white font-mono text-sm dark:bg-slate-950"
        />
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Unique id for URLs and internal references. Lowercase letters, numbers, and hyphens only — e.g.{" "}
          <span className="font-mono">my-blog</span>.
        </p>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
        {loading ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
