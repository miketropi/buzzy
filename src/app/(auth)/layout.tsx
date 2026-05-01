import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-brand/20 blur-[100px]" />
        <div className="absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-emerald-500/12 blur-[90px]" />
        <div className="absolute left-1/2 top-1/2 h-px w-[120%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-brand/25 to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="relative hidden flex-col justify-between px-10 py-14 lg:flex xl:px-14">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-ink">
              B
            </span>
            Buzzy
          </Link>
          <div className="max-w-md space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Self-hosted engagement</p>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-white xl:text-[2.75rem] xl:leading-[1.08]">
              Log in and ship comments, reviews, and ratings on your own infrastructure.
            </h1>
            <p className="text-lg leading-relaxed text-zinc-400">
              Your data stays in your workspace — API keys, allowed origins, and moderation from one dashboard.
            </p>
          </div>
          <p className="text-sm text-zinc-600">© Buzzy</p>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:border-l lg:border-white/[0.06] lg:bg-zinc-950/50 lg:px-10 lg:py-14">
          <div className="mb-8 flex items-center gap-2.5 font-semibold text-white lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-ink">
              B
            </span>
            Buzzy
          </div>
          <div className="glass-auth-panel w-full max-w-md">{children}</div>
          <p className="mt-10 max-w-md text-center text-base leading-relaxed text-zinc-500">
            Trusted by teams who want feedback on their site without building it from scratch.
          </p>
        </div>
      </div>
    </div>
  );
}
