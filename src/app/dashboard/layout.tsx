import Link from "next/link";
import { FolderOpen, LayoutDashboard, Layers, Sparkles, UserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { gravatarUrl } from "@/lib/gravatar";
import { DashboardNavLink } from "@/components/dashboard-nav-link";
import { SignOutButton } from "./sign-out-button";

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const headerEmail = session?.user?.email ?? "";
  const headerName = session?.user?.name?.trim() || null;
  const headerAvatar =
    session?.user?.image ??
    (session?.user?.email != null ? gravatarUrl(session.user.email, 80) : null);

  const sidebarLinks = (
    <>
      <NavSection label="Workspace">
        <DashboardNavLink
          variant="sidebar"
          href="/dashboard"
          description="Activity, metrics, and shortcuts"
          icon={<LayoutDashboard className="h-4 w-4" strokeWidth={2} />}
        >
          Overview
        </DashboardNavLink>
        <DashboardNavLink
          variant="sidebar"
          href="/dashboard/projects"
          match="prefix"
          description="Embed config, keys, and moderation"
          icon={<FolderOpen className="h-4 w-4" strokeWidth={2} />}
        >
          Projects
        </DashboardNavLink>
      </NavSection>
      <NavSection label="Account">
        <DashboardNavLink
          variant="sidebar"
          href="/dashboard/account"
          description="Profile, password, and Gravatar"
          icon={<UserRound className="h-4 w-4" strokeWidth={2} />}
        >
          Your account
        </DashboardNavLink>
      </NavSection>
    </>
  );

  return (
    <>
      <div
        className="sticky top-0 z-40 border-b md:hidden"
        style={{ borderColor: "var(--sidebar-border)", backgroundColor: "var(--sidebar)" }}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 font-semibold tracking-tight text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-base font-bold text-brand-ink transition group-hover:bg-brand-hover">
              B
            </span>
            Buzzy
          </Link>
          <SignOutButton tone="dark" />
        </div>
        <div className="flex gap-2 overflow-x-auto px-3 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DashboardNavLink
            variant="sidebar"
            className="shrink-0 !rounded-lg !py-2 !pl-2 !pr-2.5"
            href="/dashboard"
            description="Summary"
            icon={<LayoutDashboard className="h-4 w-4" strokeWidth={2} />}
          >
            Overview
          </DashboardNavLink>
          <DashboardNavLink
            variant="sidebar"
            className="shrink-0 !rounded-lg !py-2 !pl-2 !pr-2.5"
            href="/dashboard/projects"
            match="prefix"
            description="All projects"
            icon={<FolderOpen className="h-4 w-4" strokeWidth={2} />}
          >
            Projects
          </DashboardNavLink>
          <DashboardNavLink
            variant="sidebar"
            className="shrink-0 !rounded-lg !py-2 !pl-2 !pr-2.5"
            href="/dashboard/account"
            description="Profile"
            icon={<UserRound className="h-4 w-4" strokeWidth={2} />}
          >
            Account
          </DashboardNavLink>
        </div>
      </div>

      <div className="flex min-h-screen flex-col md:flex-row">
        <aside
          className="relative hidden w-72 shrink-0 flex-col md:flex"
          style={{
            backgroundColor: "var(--sidebar)",
            borderRight: "1px solid var(--sidebar-border)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-80"
            aria-hidden
          />
          <div
            className="flex h-[4.25rem] items-center gap-3 px-5 pt-px"
            style={{ borderBottom: "1px solid var(--sidebar-border)" }}
          >
            <Link
              href="/dashboard"
              className="group flex min-w-0 flex-1 items-center gap-3 font-semibold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-base font-bold text-brand-ink transition group-hover:bg-brand-hover">
                B
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg leading-tight">Buzzy</span>
                <span className="mt-0.5 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  Dashboard
                </span>
              </span>
            </Link>
          </div>
          <nav className="flex flex-col gap-6 overflow-y-auto p-3.5 pt-5">{sidebarLinks}</nav>
          <div className="mt-auto space-y-3 p-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
            <div
              className="rounded-xl p-3.5"
              style={{
                background: "linear-gradient(145deg, rgba(245, 219, 141, 0.07) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(245, 219, 141, 0.14)",
                boxShadow: "0 12px 40px -28px rgba(0,0,0,0.55)",
              }}
            >
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand ring-1 ring-brand/20">
                  <Layers className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-semibold leading-snug text-zinc-100">Embed studio</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Each project holds API keys, allowed domains, widget appearance, and moderation — tuned for
                    production sites.
                  </p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-zinc-500">
                <Sparkles className="h-3 w-3 text-brand/80" strokeWidth={2} aria-hidden />
                Ship comments & reviews in one script
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-app-canvas">
          <header
            className="hidden h-[4.25rem] items-center justify-between border-b px-6 backdrop-blur-xl md:flex"
            style={{
              backgroundColor: "var(--header-bg)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              {headerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element -- Gravatar external URL */
                <img
                  src={headerAvatar}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full border object-cover ring-2 ring-[var(--border)]"
                  style={{ borderColor: "var(--border)" }}
                />
              ) : null}
              <div className="min-w-0 flex flex-col gap-0.5">
                {headerName ? (
                  <span className="truncate text-sm font-semibold text-[var(--foreground)]">{headerName}</span>
                ) : null}
                <span
                  className={`max-w-[min(100%,28rem)] truncate text-sm ${
                    headerName ? "text-[var(--muted)]" : "font-medium text-[var(--foreground)]"
                  }`}
                >
                  {headerEmail}
                </span>
              </div>
            </div>
            <SignOutButton />
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-9">
            {/* Single content width for all dashboard routes (Tailwind max-w-7xl = 80rem). */}
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
