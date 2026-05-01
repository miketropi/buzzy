"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProjectSubnav({
  links,
}: {
  links: readonly { href: string; label: string }[];
}) {
  const pathname = usePathname();

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
        {links.map((t) => {
          const active = pathname === t.href;
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
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
