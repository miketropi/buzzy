"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardActivityDay } from "@/lib/dashboard/overview-stats";

function shortDate(isoDay: string) {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const AXIS = "#64748b";
const GRID = "rgba(100, 116, 139, 0.15)";

type Props = {
  activityByDay: DashboardActivityDay[];
};

export function DashboardOverviewActivity({ activityByDay }: Props) {
  const data = activityByDay.map((row) => ({ ...row, label: shortDate(row.day) }));
  const hasActivity = activityByDay.some((d) => d.comments > 0 || d.reviews > 0);

  return (
    <div
      className="rounded-2xl border p-5 md:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <h2 className="text-sm font-semibold text-[var(--foreground)]">New content (14 days, UTC)</h2>
      <p className="mt-0.5 text-xs text-[var(--muted)]">Comments and reviews created per day.</p>
      {!hasActivity ? (
        <p className="mt-10 py-6 text-center text-sm text-[var(--muted)]">No new items in this window.</p>
      ) : (
        <div className="mt-5 h-[220px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: AXIS, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => {
                  const row = data.find((d) => d.label === label);
                  return row?.day ?? String(label);
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area
                type="monotone"
                dataKey="comments"
                name="Comments"
                stroke="#b8e034"
                strokeWidth={1.5}
                fill="#f5db8d"
                fillOpacity={0.22}
              />
              <Area
                type="monotone"
                dataKey="reviews"
                name="Reviews"
                stroke="#0ea5e9"
                strokeWidth={1.5}
                fill="#38bdf8"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
