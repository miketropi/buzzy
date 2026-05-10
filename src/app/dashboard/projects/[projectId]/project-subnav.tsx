"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function navLinkActiveIndex(pathname: string, links: readonly { href: string }[]): number {
  let best = -1;
  let bestLen = -1;
  links.forEach((t, i) => {
    if (pathname === t.href || pathname.startsWith(`${t.href}/`)) {
      if (t.href.length > bestLen) {
        bestLen = t.href.length;
        best = i;
      }
    }
  });
  return best;
}

export function ProjectSubnav({
  links,
}: {
  links: readonly { href: string; label: string; badge?: string }[];
}) {
  const pathname = usePathname();
  const activeIdx = navLinkActiveIndex(pathname, links);

  return (
    <nav
      className="rounded-xl p-1 sm:p-1.5"
      style={{
        background: "var(--surface-muted)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 0 rgba(15, 23, 42, 0.03) inset",
      }}
    >
      <div className="flex flex-wrap gap-1">
        {links.map((t, i) => {
          const active = i === activeIdx;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 sm:px-4 sm:py-2.5 sm:text-[0.9375rem] ${
                active
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm ring-1 ring-brand/35 dark:bg-[var(--surface-elevated)] dark:shadow-none"
                  : "text-[var(--muted)] hover:bg-[var(--surface)]/85 hover:text-[var(--foreground)]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge !== null ? (
                  <span
                    className={`min-w-[1.5rem] rounded-md px-1.5 py-0.5 text-center text-[0.7rem] font-bold leading-none tabular-nums ${
                      active
                        ? "bg-brand/20 text-brand dark:bg-brand/25"
                        : "bg-[var(--border)]/80 text-[var(--foreground)]/90 dark:bg-white/10"
                    }`}
                    aria-label={`${t.label}: ${t.badge}`}
                  >
                    {t.badge}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
