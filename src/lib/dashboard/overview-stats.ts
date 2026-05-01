import { prisma } from "@/lib/prisma";

const ACTIVITY_DAYS = 14;

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildDayRange(): string[] {
  const days: string[] = [];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
    const x = new Date(end);
    x.setUTCDate(x.getUTCDate() - i);
    days.push(utcDayKey(x));
  }
  return days;
}

export type DashboardActivityDay = {
  day: string;
  comments: number;
  reviews: number;
};

export type DashboardOverviewStats = {
  projectCount: number;
  commentCount: number;
  reviewCount: number;
  pendingComments: number;
  pendingReviews: number;
  activityByDay: DashboardActivityDay[];
  recentItems: {
    id: string;
    kind: "comment" | "review";
    excerpt: string;
    status: string;
    createdAt: string;
    projectName: string;
    projectId: string;
  }[];
};

export async function getDashboardOverviewStats(ownerId: string): Promise<DashboardOverviewStats> {
  const projectsForUser = await prisma.project.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const projectIds = projectsForUser.map((p) => p.id);

  const empty: DashboardOverviewStats = {
    projectCount: 0,
    commentCount: 0,
    reviewCount: 0,
    pendingComments: 0,
    pendingReviews: 0,
    activityByDay: buildDayRange().map((day) => ({ day, comments: 0, reviews: 0 })),
    recentItems: [],
  };

  if (projectIds.length === 0) {
    return empty;
  }

  const rangeStart = new Date();
  rangeStart.setUTCHours(0, 0, 0, 0);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - (ACTIVITY_DAYS - 1));

  const [
    projectCount,
    commentCount,
    reviewCount,
    pendingComments,
    pendingReviews,
    recentComments,
    recentReviews,
    activityComments,
    activityReviews,
  ] = await Promise.all([
    prisma.project.count({ where: { ownerId } }),
    prisma.comment.count({ where: { projectId: { in: projectIds } } }),
    prisma.review.count({ where: { projectId: { in: projectIds } } }),
    prisma.comment.count({
      where: { projectId: { in: projectIds }, status: "pending" },
    }),
    prisma.review.count({
      where: { projectId: { in: projectIds }, status: "pending" },
    }),
    prisma.comment.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        projectId: true,
        project: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        content: true,
        title: true,
        status: true,
        createdAt: true,
        projectId: true,
        project: { select: { name: true } },
      },
    }),
    prisma.comment.findMany({
      where: { projectId: { in: projectIds }, createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.review.findMany({
      where: { projectId: { in: projectIds }, createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
  ]);

  const dayLabels = buildDayRange();
  const commentByDay = new Map<string, number>();
  const reviewByDay = new Map<string, number>();
  for (const d of dayLabels) {
    commentByDay.set(d, 0);
    reviewByDay.set(d, 0);
  }
  for (const c of activityComments) {
    const k = utcDayKey(c.createdAt);
    if (commentByDay.has(k)) commentByDay.set(k, (commentByDay.get(k) ?? 0) + 1);
  }
  for (const r of activityReviews) {
    const k = utcDayKey(r.createdAt);
    if (reviewByDay.has(k)) reviewByDay.set(k, (reviewByDay.get(k) ?? 0) + 1);
  }
  const activityByDay: DashboardActivityDay[] = dayLabels.map((day) => ({
    day,
    comments: commentByDay.get(day) ?? 0,
    reviews: reviewByDay.get(day) ?? 0,
  }));

  const excerpt = (s: string, n: number) => {
    const t = s.replace(/\s+/g, " ").trim();
    if (t.length <= n) return t || "—";
    return `${t.slice(0, n)}…`;
  };

  type RecentUnion =
    | {
        kind: "comment";
        id: string;
        excerpt: string;
        status: string;
        createdAt: Date;
        projectName: string;
        projectId: string;
      }
    | {
        kind: "review";
        id: string;
        excerpt: string;
        status: string;
        createdAt: Date;
        projectName: string;
        projectId: string;
      };

  const merged: RecentUnion[] = [
    ...recentComments.map(
      (c): RecentUnion => ({
        kind: "comment",
        id: c.id,
        excerpt: excerpt(c.content, 88),
        status: c.status,
        createdAt: c.createdAt,
        projectName: c.project.name,
        projectId: c.projectId,
      }),
    ),
    ...recentReviews.map(
      (r): RecentUnion => ({
        kind: "review",
        id: r.id,
        excerpt: excerpt((r.title ? `${r.title} — ` : "") + (r.content ?? ""), 88),
        status: r.status,
        createdAt: r.createdAt,
        projectName: r.project.name,
        projectId: r.projectId,
      }),
    ),
  ];
  merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const recentItems = merged.slice(0, 4).map((x) => ({
    id: x.id,
    kind: x.kind,
    excerpt: x.excerpt,
    status: x.status,
    createdAt: x.createdAt.toISOString(),
    projectName: x.projectName,
    projectId: x.projectId,
  }));

  return {
    projectCount,
    commentCount,
    reviewCount,
    pendingComments,
    pendingReviews,
    activityByDay,
    recentItems,
  };
}
