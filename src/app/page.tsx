import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Code2, MessageCircle, Sparkles, Star } from "lucide-react";

const features: readonly {
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Comments & threads",
    body: "Nested replies, voting, and moderation that match how your community actually talks.",
    icon: MessageCircle,
  },
  {
    title: "Reviews & ratings",
    body: "Star ratings, optional criteria, and summaries you can surface anywhere in your funnel.",
    icon: Star,
  },
  {
    title: "One embed, your brand",
    body: "Theme colors, typography, and domains you control — the widget feels native, not bolted on.",
    icon: Code2,
  },
];

const steps = [
  "Create a project and allowed domains",
  "Drop in your API key and our lightweight script",
  "Tune appearance and moderation in the dashboard",
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-brand/25 blur-[100px]" />
        <div className="absolute -right-24 top-1/3 h-[360px] w-[360px] rounded-full bg-emerald-400/15 blur-[90px]" />
        <div className="absolute bottom-0 left-1/2 h-px w-[min(1400px,100vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      </div>

      <header className="relative border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <span className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-ink">
              B
            </span>
            Buzzy
          </span>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-base font-medium text-zinc-400 transition hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-hover sm:text-base"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 pb-28 pt-16 sm:pt-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/35 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Embeddable engagement
            </p>
            <h1 className="mt-7 max-w-xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.02]">
              Feedback that feels{" "}
              <span className="bg-gradient-to-r from-brand via-amber-200 to-amber-400 bg-clip-text text-transparent">
                built in
              </span>
              , not bolted on.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              Comments, reviews, and ratings for teams who ship their own stack. Self-host the dashboard, wire MySQL and
              Redis, and drop in a widget that respects your domains and your visual system.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary px-7 py-3.5 text-base">
                Create free account
              </Link>
              <Link
                href="/login"
                className="btn-secondary border-zinc-600 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800"
              >
                Sign in
              </Link>
            </div>
            <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-10 sm:max-w-lg sm:gap-8">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">API</dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums text-white sm:text-3xl">v1</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Embed</dt>
                <dd className="mt-1.5 text-2xl font-bold text-white sm:text-3xl">One script</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Host</dt>
                <dd className="mt-1.5 text-2xl font-bold text-white sm:text-3xl">Yours</dd>
              </div>
            </dl>
          </div>

          <div className="relative flex-1 lg:max-w-md">
            <div className="absolute -inset-4 rounded-lg bg-gradient-to-br from-brand/20 via-transparent to-emerald-500/10 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-xl sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Live preview</span>
                <span className="rounded-md bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">Widget</span>
              </div>
              <div className="space-y-3 rounded-md border border-white/[0.06] bg-zinc-950/80 p-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-brand to-amber-400" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-2.5 w-3/4 max-w-[200px] rounded-full bg-zinc-800" />
                    <div className="h-2 w-full rounded-full bg-zinc-800/80" />
                    <div className="h-2 w-5/6 rounded-full bg-zinc-800/60" />
                  </div>
                </div>
                <div className="flex gap-3 pl-8">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-700" />
                  <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                    <div className="h-2 w-full rounded-full bg-zinc-800/90" />
                    <div className="h-2 w-4/5 rounded-full bg-zinc-800/70" />
                  </div>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  Origin-safe public API
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  Rate limits &amp; spam signals
                </li>
              </ul>
            </div>
          </div>
        </div>

        <ul className="mt-24 grid gap-5 sm:grid-cols-3">
          {features.map((f) => {
            const Ico = f.icon;
            return (
              <li
                key={f.title}
                className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-zinc-900/50 p-6 transition duration-300 hover:border-brand/30"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-brand/15 text-brand transition group-hover:bg-brand/25">
                  <Ico className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-semibold text-white">{f.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-zinc-400">{f.body}</p>
              </li>
            );
          })}
        </ul>

        <section className="mt-20 grid gap-10 rounded-lg border border-white/[0.08] bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">From zero to embedded in minutes</h2>
            <p className="mt-3 text-base text-zinc-400">
              Public REST under <code className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-sm text-brand">/api/v1</code>{" "}
              — rate limits, CORS, and keys designed for production.
            </p>
            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-ink">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-base leading-relaxed text-zinc-300">{s}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-md border border-dashed border-zinc-600/80 bg-zinc-950/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Developer tip</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              See <code className="text-zinc-300">PROJECT.md</code> for embed instructions, env vars, and how rating
              summaries sync to your pages.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex text-base font-semibold text-brand transition hover:text-brand-hover"
            >
              Open dashboard →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
