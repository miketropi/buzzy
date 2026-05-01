import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FolderOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { DashboardOverviewActivity } from "@/components/dashboard-overview-activity";
import { getDashboardOverviewStats } from "@/lib/dashboard/overview-stats";

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">{value}</p>
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
    <div className="space-y-8">
      <div>
        <p className="dash-kicker">Overview</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Hi, {name}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
          Workspace totals across your projects. Open a project for keys, domains, and moderation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Projects" value={stats.projectCount} />
        <Metric label="Comments" value={stats.commentCount} />
        <Metric label="Reviews" value={stats.reviewCount} />
        <Metric label="Pending" value={pending} />
      </div>

      {pending > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          <span className="font-medium text-amber-700 dark:text-amber-300">{pending} item(s)</span> awaiting moderation —{" "}
          <Link href="/dashboard/projects" className="font-medium text-brand hover:underline">
            open a project → Messages
          </Link>
        </p>
      ) : null}

      <DashboardOverviewActivity activityByDay={stats.activityByDay} />

      {stats.recentItems.length > 0 ? (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Latest</h2>
          <ul className="mt-3 divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {stats.recentItems.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="py-3 text-sm">
                <p className="text-[var(--foreground)] line-clamp-2">{item.excerpt}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  <Link href={`/dashboard/projects/${item.projectId}`} className="hover:text-brand">
                    {item.projectName}
                  </Link>
                  {" · "}
                  {item.kind}
                  {item.status === "pending" ? " · pending" : null}
                  {" · "}
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href="/dashboard/projects"
        className="flex items-center justify-center gap-2 rounded-xl border border-transparent bg-brand py-3.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-hover"
      >
        <FolderOpen className="h-4 w-4" strokeWidth={2} aria-hidden />
        Projects
        <ArrowRight className="h-4 w-4 opacity-80" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}
