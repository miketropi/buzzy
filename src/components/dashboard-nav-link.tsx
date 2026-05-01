"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNavLink({
  href,
  match = "exact",
  variant = "light",
  icon,
  className,
  description,
  children,
}: {
  href: string;
  match?: "exact" | "prefix";
  variant?: "light" | "sidebar";
  icon?: ReactNode;
  className?: string;
  /** Optional subtitle below the label (workspace sidebar and mobile strip). */
  description?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active =
    match === "prefix"
      ? pathname === href || pathname.startsWith(`${href}/`)
      : pathname === href;

  if (variant === "sidebar") {
    return (
      <Link
        href={href}
        className={`group relative flex items-start gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 ${
          active
            ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(245,219,141,0.16)]"
            : "text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
        } ${className ?? ""}`}
      >
        {active ? (
          <span
            className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-brand"
            aria-hidden
          />
        ) : null}
        {icon ? (
          <span
            className={`relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              active
                ? "bg-brand/15 text-brand"
                : "bg-zinc-800/80 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300"
            }`}
          >
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9375rem] font-semibold leading-tight tracking-tight">{children}</span>
          {description ? (
            <span
              className={`mt-0.5 block text-[0.625rem] font-medium leading-snug sm:text-[0.65rem] md:text-[0.6875rem] lg:text-[0.7rem] ${
                active ? "text-zinc-500" : "text-zinc-500 group-hover:text-zinc-400"
              }`}
            >
              {description}
            </span>
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-[15px] font-medium transition-all duration-200 ${
        active
          ? "border border-brand/30 bg-brand-muted text-brand-ink dark:bg-brand/10 dark:text-brand"
          : "border border-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/90"
      } ${className ?? ""}`}
    >
      {icon}
      {children}
    </Link>
  );
}
