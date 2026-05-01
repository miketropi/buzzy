import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FolderOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, slug: true, updatedAt: true },
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="dash-hero max-w-2xl flex-1 !py-6 sm:!py-7">
          <p className="dash-kicker">Workspace</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-[2.125rem] md:leading-tight">
            Projects
          </h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--muted)] sm:text-base">
            Organize embeds by site or product. Every project has its own API keys, domain allowlist, and appearance —
            tuned to your brand&apos;s gold accent and neutrals.
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary shrink-0 self-start sm:self-auto">
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-8 py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-2xl font-bold text-brand ring-1 ring-brand/25 dark:bg-brand/20">
            +
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">No projects yet</h2>
          <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-[var(--muted)]">
            Create your first project to generate API keys, define which domains may load the widget, and customize how
            the embed looks on your pages.
          </p>
          <Link href="/dashboard/projects/new" className="btn-primary mt-8">
            Create project
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:border-brand/40 hover:shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:hover:border-brand/35 dark:hover:shadow-[0_16px_48px_-32px_rgba(0,0,0,0.65)]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--muted)] ring-1 ring-[var(--border)] transition group-hover:bg-brand/15 group-hover:text-brand group-hover:ring-brand/25">
                    <FolderOpen className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-[var(--muted)] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-brand"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
                <p className="font-semibold text-[var(--foreground)] transition group-hover:text-brand">{p.name}</p>
                <p className="mt-1 truncate text-sm text-[var(--muted)]">{p.slug}</p>
                <p className="mt-4 text-xs font-medium text-[var(--muted)]">
                  Updated{" "}
                  {p.updatedAt.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-brand"
      >
        <span aria-hidden>←</span> Dashboard overview
      </Link>
    </div>
  );
}
