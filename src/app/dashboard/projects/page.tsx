import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, FolderKanban, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { WIDGET_MODE_PREVIEW, normalizeWidgetMode } from "@/lib/widget-mode-ux";

function updatedLabel(d: Date): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const ms = Date.now() - d.getTime();
  if (ms < 45_000) return "Just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, "day");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function allowedDomainCount(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  return raw.filter((x) => typeof x === "string" && x.trim().length > 0).length;
}

function submissionApprovalLabel(settingsJson: Prisma.JsonValue | null | undefined): {
  label: string;
  title: string;
} {
  const needApproval = getEffectiveSettings(settingsJson).requireApproval;
  return needApproval
    ? {
        label: "Review",
        title: "New submissions must be approved before going live.",
      }
    : {
        label: "Instant",
        title: "New submissions publish immediately.",
      };
}

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
      createdAt: true,
      widgetMode: true,
      settings: true,
      allowedDomains: true,
      _count: {
        select: {
          comments: true,
          reviews: true,
          pages: true,
          apiKeys: { where: { revokedAt: null } },
        },
      },
    },
  });

  const projectIds = projects.map((p) => p.id);
  const pendingByProject = new Map<string, number>();

  if (projectIds.length > 0) {
    const [pendingComments, pendingReviews] = await Promise.all([
      prisma.comment.groupBy({
        by: ["projectId"],
        where: { projectId: { in: projectIds }, status: "pending" },
        _count: { _all: true },
      }),
      prisma.review.groupBy({
        by: ["projectId"],
        where: { projectId: { in: projectIds }, status: "pending" },
        _count: { _all: true },
      }),
    ]);

    for (const row of pendingComments) {
      pendingByProject.set(row.projectId, (pendingByProject.get(row.projectId) ?? 0) + row._count._all);
    }
    for (const row of pendingReviews) {
      pendingByProject.set(row.projectId, (pendingByProject.get(row.projectId) ?? 0) + row._count._all);
    }
  }

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
        <Link href="/dashboard" className="transition hover:text-[var(--foreground)]">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" strokeWidth={2} aria-hidden />
        <span className="font-medium text-[var(--foreground)]">Projects</span>
      </nav>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-2xl space-y-2">
          <p className="dash-kicker">Workspace</p>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">Projects</h1>
          <p className="text-sm leading-relaxed text-[var(--muted)] md:text-[0.9375rem]">
            One place per site or product — API keys, domains, widget styling, and moderation.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="card-surface p-0">
          <div className="flex flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-20">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/12 text-brand ring-1 ring-brand/20">
              <FolderKanban className="h-8 w-8" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">Create your first project</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              You’ll get API keys, a domain allowlist, and embed appearance controls — then you can drop in comments or
              reviews on your pages.
            </p>
            <Link href="/dashboard/projects/new" className="btn-primary mt-8 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              New project
            </Link>
          </div>
        </div>
      ) : (
        <section className="card-surface overflow-hidden p-0" aria-labelledby="projects-heading">
          <div
            id="projects-heading"
            className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-muted)" }}
          >
            <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Your projects
            </h2>
            <p className="tabular-nums text-xs font-medium text-[var(--muted)]">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          </div>
          <ul role="list" className="divide-y" style={{ borderColor: "var(--border)" }}>
            {projects.map((p) => {
              const mode = normalizeWidgetMode(p.widgetMode);
              const modeMeta = WIDGET_MODE_PREVIEW[mode];
              const approvalBadge = submissionApprovalLabel(p.settings);
              const domains = allowedDomainCount(p.allowedDomains);
              const pending = pendingByProject.get(p.id) ?? 0;
              const { comments: nComments, reviews: nReviews, pages: nPages, apiKeys: nKeys } = p._count;

              return (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-muted)_65%,transparent)] sm:gap-4 sm:px-5 sm:py-4"
                  >
                    <span
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] ring-1 ring-[var(--border)] transition group-hover:bg-brand/12 group-hover:text-brand group-hover:ring-brand/25"
                      style={{ backgroundColor: "var(--surface-muted)" }}
                    >
                      <FolderKanban className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[var(--foreground)] transition group-hover:text-brand">
                        {p.name}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs text-[var(--muted)]">{p.slug}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] leading-snug text-[var(--muted)] sm:text-xs">
                        <span
                          className="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-[var(--foreground)] ring-1 ring-[var(--border)]"
                          style={{ backgroundColor: "var(--surface-muted)" }}
                        >
                          {modeMeta.label}
                        </span>
                        <span
                          className="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-[var(--muted)] ring-1 ring-[var(--border)]"
                          style={{ backgroundColor: "var(--surface-muted)" }}
                          title={approvalBadge.title}
                        >
                          {approvalBadge.label}
                        </span>
                        <span className="min-w-0">
                          <span className="tabular-nums">{nComments}</span>{" "}
                          {nComments === 1 ? "comment" : "comments"}
                          <span className="mx-1.5 opacity-40" aria-hidden>
                            ·
                          </span>
                          <span className="tabular-nums">{nReviews}</span> {nReviews === 1 ? "review" : "reviews"}
                          <span className="mx-1.5 opacity-40" aria-hidden>
                            ·
                          </span>
                          <span className="tabular-nums">{nPages}</span> {nPages === 1 ? "page" : "pages"}
                          <span className="mx-1.5 opacity-40" aria-hidden>
                            ·
                          </span>
                          <span className="tabular-nums">{nKeys}</span> active {nKeys === 1 ? "key" : "keys"}
                          <span className="mx-1.5 opacity-40" aria-hidden>
                            ·
                          </span>
                          <span className="tabular-nums">{domains}</span>{" "}
                          {domains === 1 ? "allowed domain" : "allowed domains"}
                        </span>
                        {pending > 0 ? (
                          <span className="font-medium text-amber-700 dark:text-amber-300">
                            <span className="tabular-nums">{pending}</span> pending
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-[0.65rem] text-[var(--muted)]">
                        Created{" "}
                        {p.createdAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <span className="sm:hidden">
                          {" "}
                          · Updated {updatedLabel(p.updatedAt)}
                        </span>
                      </p>
                    </div>
                    <div className="hidden shrink-0 pt-0.5 text-right sm:block">
                      <p className="text-xs font-medium text-[var(--muted)]">Updated {updatedLabel(p.updatedAt)}</p>
                      <p className="mt-0.5 text-[0.65rem] tabular-nums text-[var(--muted)] opacity-75">
                        {p.updatedAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <ChevronRight
                      className="mt-1 h-5 w-5 shrink-0 self-center text-[var(--muted)] opacity-40 transition group-hover:translate-x-0.5 group-hover:text-brand group-hover:opacity-100"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
