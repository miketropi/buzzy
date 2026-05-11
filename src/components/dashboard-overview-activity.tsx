"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardActivityDay } from "@/lib/dashboard/overview-stats";

function shortDate(isoDay: string) {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtFullDate(isoDay: string) {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type ChartPalette = {
  axis: string;
  grid: string;
  tick: number;
  comments: {
    stroke: string;
    gradientStop: string;
    dot: string;
  };
  reviews: {
    stroke: string;
    gradientStop: string;
    dot: string;
  };
  tooltipBg: string;
  tooltipBorder: string;
  tooltipMuted: string;
};

const PALETTE_LIGHT: ChartPalette = {
  axis: "rgba(60, 60, 67, 0.32)",
  grid: "rgba(60, 60, 67, 0.08)",
  tick: 10,
  comments: {
    stroke: "#b8860d",
    gradientStop: "rgba(217, 170, 32, 0.55)",
    dot: "#c9a227",
  },
  reviews: {
    stroke: "#1582e9",
    gradientStop: "rgba(54, 144, 230, 0.5)",
    dot: "#2d8ceb",
  },
  tooltipBg: "rgba(255, 255, 255, 0.94)",
  tooltipBorder: "rgba(60, 60, 67, 0.12)",
  tooltipMuted: "rgba(60, 60, 67, 0.55)",
};

const PALETTE_DARK: ChartPalette = {
  axis: "rgba(235, 235, 245, 0.35)",
  grid: "rgba(235, 235, 245, 0.09)",
  tick: 10,
  comments: {
    stroke: "#ebc04a",
    gradientStop: "rgba(241, 201, 99, 0.45)",
    dot: "#e8bd45",
  },
  reviews: {
    stroke: "#64b9ff",
    gradientStop: "rgba(100, 185, 255, 0.42)",
    dot: "#5cb3ff",
  },
  tooltipBg: "rgba(28, 28, 30, 0.92)",
  tooltipBorder: "rgba(255, 255, 255, 0.12)",
  tooltipMuted: "rgba(235, 235, 245, 0.45)",
};

function useChartPalette(): ChartPalette {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setDark(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return dark ? PALETTE_DARK : PALETTE_LIGHT;
}

type Props = {
  activityByDay: DashboardActivityDay[];
};

export function DashboardOverviewActivity({ activityByDay }: Props) {
  const palette = useChartPalette();
  const data = useMemo(
    () => activityByDay.map((row) => ({ ...row, label: shortDate(row.day) })),
    [activityByDay],
  );

  const summary = useMemo(() => {
    let c = 0;
    let r = 0;
    let peakDay = "";
    let peak = 0;
    for (const d of activityByDay) {
      c += d.comments;
      r += d.reviews;
      const t = d.comments + d.reviews;
      if (t > peak) {
        peak = t;
        peakDay = d.day;
      }
    }
    return { totalComments: c, totalReviews: r, peak, peakDay };
  }, [activityByDay]);

  const hasActivity = activityByDay.some((d) => d.comments > 0 || d.reviews > 0);

  return (
    <section className="dash-panel relative overflow-hidden" aria-labelledby="dash-activity-heading">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--accent-subtle)] to-transparent opacity-90"
        aria-hidden
      />
      <div className="relative px-5 pb-5 pt-5 md:px-7 md:pb-6 md:pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Activity
            </p>
            <h2 id="dash-activity-heading" className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              New content
            </h2>
            <p className="max-w-md text-[0.8125rem] leading-relaxed text-[var(--muted)]">
              Comments and reviews created over the last 14 days <span className="whitespace-nowrap">(UTC).</span>
            </p>
          </div>

          {hasActivity ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.75rem] font-medium tabular-nums text-[var(--foreground)]">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: palette.comments.dot }}
                  aria-hidden
                />
                {summary.totalComments} comments
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.75rem] font-medium tabular-nums text-[var(--foreground)]">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: palette.reviews.dot }}
                  aria-hidden
                />
                {summary.totalReviews} reviews
              </span>
              {summary.peak > 0 && summary.peakDay ? (
                <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.75rem] font-medium tabular-nums text-[var(--muted)]">
                  Peak&nbsp;
                  <span className="text-[var(--foreground)]">{shortDate(summary.peakDay)}</span>
                  <span className="mx-1 text-[var(--border-strong)]">·</span>
                  {summary.peak}/day
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {!hasActivity ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)]/35 py-14 text-center">
            <span className="text-sm font-semibold tracking-[-0.01em] text-[var(--foreground)]">
              Quiet week
            </span>
            <p className="mt-2 max-w-xs text-[0.8125rem] leading-relaxed text-[var(--muted)]">
              Nothing new in this window yet. Embed traffic will show here as visitors post comments or reviews.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex min-[420px]:hidden flex-wrap gap-4 border-b border-[var(--border)] pb-3 text-[0.75rem]" aria-hidden>
              <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white/80 dark:ring-black/35"
                  style={{ backgroundColor: palette.comments.stroke }}
                />
                <span className="font-medium text-[var(--foreground)]">Comments</span>
              </span>
              <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white/80 dark:ring-black/35"
                  style={{ backgroundColor: palette.reviews.stroke }}
                />
                <span className="font-medium text-[var(--foreground)]">Reviews</span>
              </span>
            </div>
            <div className="mt-6 hidden min-[420px]:flex flex-wrap gap-5 pb-2 text-[0.75rem]" aria-hidden>
              <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white/80 dark:ring-black/35"
                  style={{ backgroundColor: palette.comments.stroke }}
                />
                <span className="font-medium text-[var(--foreground)]">Comments</span>
              </span>
              <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white/80 dark:ring-black/35"
                  style={{ backgroundColor: palette.reviews.stroke }}
                />
                <span className="font-medium text-[var(--foreground)]">Reviews</span>
              </span>
              <span className="grow" />
              <span className="tabular-nums text-[0.7rem] text-[var(--muted)]">Stacked totals</span>
            </div>
            <div className="-mx-1 mt-1 h-[260px] w-[calc(100%+0.25rem)] min-w-0 sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 2 }}>
                  <defs>
                    <linearGradient id="dashCommentsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.comments.gradientStop} stopOpacity={0.92} />
                      <stop offset="78%" stopColor={palette.comments.gradientStop} stopOpacity={0.12} />
                      <stop offset="100%" stopColor={palette.comments.gradientStop} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashReviewsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.reviews.gradientStop} stopOpacity={0.88} />
                      <stop offset="72%" stopColor={palette.reviews.gradientStop} stopOpacity={0.1} />
                      <stop offset="100%" stopColor={palette.reviews.gradientStop} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 6"
                    stroke={palette.grid}
                    vertical={false}
                    strokeOpacity={1}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: palette.axis, fontSize: palette.tick }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    dy={6}
                  />
                  <YAxis
                    tick={{ fill: palette.axis, fontSize: palette.tick }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={34}
                  />
                  <Tooltip
                    cursor={{ stroke: palette.grid, strokeWidth: 1 }}
                    wrapperStyle={{ outline: "none", zIndex: 20 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const num = (key: string) => {
                        const v = payload.find((p) => p.dataKey === key)?.value;
                        return typeof v === "number" ? v : Number(v) || 0;
                      };
                      const comments = num("comments");
                      const reviews = num("reviews");
                      const row = data.find((d) => d.label === label);
                      const subtitle = row ? fmtFullDate(row.day) : String(label ?? "");
                      return (
                        <div
                          className="rounded-xl border px-3.5 py-2.5 shadow-lg backdrop-blur-md"
                          style={{
                            borderColor: palette.tooltipBorder,
                            backgroundColor: palette.tooltipBg,
                            boxShadow:
                              "0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.06) inset",
                          }}
                        >
                          <p className="text-[0.7rem] font-medium" style={{ color: palette.tooltipMuted }}>
                            {subtitle}
                          </p>
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center justify-between gap-6 text-[0.8125rem]">
                              <span className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: palette.comments.stroke }}
                                  aria-hidden
                                />
                                Comments
                              </span>
                              <span className="font-semibold tabular-nums text-[var(--foreground)]">{comments}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6 text-[0.8125rem]">
                              <span className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: palette.reviews.stroke }}
                                  aria-hidden
                                />
                                Reviews
                              </span>
                              <span className="font-semibold tabular-nums text-[var(--foreground)]">{reviews}</span>
                            </div>
                            <div
                              className="mt-1.5 flex items-center justify-between border-t border-[var(--border)] pt-1.5 text-[0.7rem] tabular-nums"
                              style={{ color: palette.tooltipMuted }}
                            >
                              <span>Combined</span>
                              <span className="font-semibold text-[var(--foreground)]">{comments + reviews}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="natural"
                    dataKey="comments"
                    stackId="a"
                    name="Comments"
                    stroke={palette.comments.stroke}
                    strokeWidth={1.75}
                    fill="url(#dashCommentsFill)"
                  />
                  <Area
                    type="natural"
                    dataKey="reviews"
                    stackId="a"
                    name="Reviews"
                    stroke={palette.reviews.stroke}
                    strokeWidth={1.75}
                    fill="url(#dashReviewsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
