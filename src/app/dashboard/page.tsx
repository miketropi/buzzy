import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, FolderOpen, MessageSquare, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { DashboardOverviewActivity } from "@/components/dashboard-overview-activity";
import { getDashboardOverviewStats } from "@/lib/dashboard/overview-stats";

function MetricTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="dash-panel flex flex-col gap-3 p-4 sm:flex-1 sm:min-h-[7.25rem] sm:p-5">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--muted)] ring-1 ring-[var(--border)]"
        aria-hidden
      >
        {icon}
      </span>
      <div className="mt-auto">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-[var(--foreground)]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const name = session?.user?.name ?? "there";
  const stats = await getDashboardOverviewStats(session.user.id);
  const pending = stats.pendingComments + stats.pendingReviews;

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="dash-hero">
        <p className="dash-kicker">Overview</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.75rem]">
          Hi, {name}
        </h1>
        <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--muted)]">
          Totals across every project you own — open a project for API keys, allowed domains, widget look, and
          moderation.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Projects"
          value={stats.projectCount}
          icon={<FolderOpen className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />}
        />
        <MetricTile
          label="Comments"
          value={stats.commentCount}
          icon={<MessageSquare className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />}
        />
        <MetricTile
          label="Reviews"
          value={stats.reviewCount}
          icon={<Star className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />}
        />
        <MetricTile
          label="Pending"
          value={pending}
          icon={<Clock className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />}
        />
      </div>

      {pending > 0 ? (
        <div
          className="flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 sm:py-4"
          style={{
            borderColor: "color-mix(in srgb, rgb(245 158 11) 26%, var(--border))",
            background:
              "linear-gradient(135deg, color-mix(in srgb, rgb(245 158 11) 9%, var(--surface)) 0%, var(--surface) 62%)",
            boxShadow:
              "0 0 0 1px color-mix(in srgb, rgb(245 158 11) 10%, transparent) inset, 0 10px 36px -28px rgba(245, 158, 11, 0.35)",
          }}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/[0.13] text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300">
              <Clock className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--foreground)]">Moderation</p>
              <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                <span className="font-semibold tabular-nums text-amber-800 dark:text-amber-300">{pending}</span>
                {" "}
                {pending === 1
                  ? "item is waiting for approval — open Messages on that project."
                  : "items are waiting for approval — review them from each project’s Messages."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/projects"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] px-4 py-2.5 text-[0.8125rem] font-semibold text-[var(--foreground)] ring-1 ring-[var(--border-strong)] transition hover:bg-[var(--surface-muted)]"
          >
            Open projects
          </Link>
        </div>
      ) : null}

      <DashboardOverviewActivity activityByDay={stats.activityByDay} />

      {stats.recentItems.length > 0 ? (
        <section className="dash-panel overflow-hidden p-0" aria-labelledby="dash-latest-heading">
          <div className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-muted)]/55 to-transparent px-5 py-4 md:px-6">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Feed</p>
            <h2
              id="dash-latest-heading"
              className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]"
            >
              Recent activity
            </h2>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
              Latest comments and reviews across your workspace.
            </p>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {stats.recentItems.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="transition-colors hover:bg-[var(--surface-muted)]/40">
                <div className="px-5 py-3.5 md:px-6">
                  <p className="text-[0.9375rem] font-medium leading-snug tracking-[-0.015em] text-[var(--foreground)] line-clamp-2">
                    {item.excerpt}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-[var(--muted)]">
                    <Link
                      href={`/dashboard/projects/${item.projectId}`}
                      className="font-medium text-brand transition hover:text-brand-hover hover:underline underline-offset-2"
                    >
                      {item.projectName}
                    </Link>
                    <span className="text-[var(--border-strong)]" aria-hidden>
                      ·
                    </span>
                    <span className="capitalize">{item.kind}</span>
                    {item.status === "pending" ? (
                      <>
                        <span className="text-[var(--border-strong)]" aria-hidden>
                          ·
                        </span>
                        <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                          Pending
                        </span>
                      </>
                    ) : null}
                    <span className="text-[var(--border-strong)]" aria-hidden>
                      ·
                    </span>
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/dashboard/projects"
        className="dash-panel group flex items-center justify-between gap-4 px-5 py-4 no-underline transition duration-200 hover:border-[var(--border-strong)] md:px-6 md:py-5"
      >
        <span className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/14 text-brand ring-1 ring-brand/22">
            <FolderOpen className="h-[1.25rem] w-[1.25rem]" strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Workspace
            </span>
            <span className="mt-0.5 block text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              All projects
            </span>
            <span className="mt-0.5 block max-w-[20rem] truncate text-[0.8125rem] text-[var(--muted)]">
              Keys, domains, appearance, and Messages
            </span>
          </span>
        </span>
        <ArrowRight
          className="h-5 w-5 shrink-0 text-[var(--muted)] transition duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
          strokeWidth={2}
          aria-hidden
        />
      </Link>
    </div>
  );
}
