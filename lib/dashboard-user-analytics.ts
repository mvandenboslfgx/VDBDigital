/**
 * User-facing analytics for /dashboard/analytics (server-only aggregation).
 */
import { prisma } from "@/lib/prisma";
import { getUsage } from "@/lib/usage";
import { getOrSet } from "@/lib/cache";
import { CACHE_TTL_MS, CACHE_KEYS } from "@/lib/cache-policy";

export type UserAnalyticsSnapshot = {
  totalReports: number;
  /** Last 7 calendar days, oldest → newest */
  scansByDay: { label: string; count: number }[];
  lastScores: {
    seo: number;
    perf: number;
    ux: number;
    conv: number;
    avg: number;
  } | null;
};

function last7DayBuckets(rows: { createdAt: Date }[]): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = r.createdAt.toISOString().slice(0, 10);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const out: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    out.push({
      label: d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" }),
      count: counts.get(key) ?? 0,
    });
  }
  return out;
}

export async function getUserAnalyticsSnapshot(userId: string, email: string): Promise<UserAnalyticsSnapshot> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  since.setHours(0, 0, 0, 0);

  const [totalReports, weekRows, lastReport] = await Promise.all([
    prisma.auditReport.count({ where: { lead: { email } } }),
    prisma.auditReport.findMany({
      where: { lead: { email }, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.auditReport.findFirst({
      where: { lead: { email } },
      orderBy: { createdAt: "desc" },
      select: {
        seoScore: true,
        perfScore: true,
        uxScore: true,
        convScore: true,
      },
    }),
  ]);

  const scansByDay = last7DayBuckets(weekRows);

  let lastScores: UserAnalyticsSnapshot["lastScores"] = null;
  if (lastReport) {
    const { seoScore, perfScore, uxScore, convScore } = lastReport;
    const avg = Math.round((seoScore + perfScore + uxScore + convScore) / 4);
    lastScores = { seo: seoScore, perf: perfScore, ux: uxScore, conv: convScore, avg };
  }

  return {
    totalReports,
    scansByDay,
    lastScores,
  };
}

export async function getDashboardAnalyticsBundle(userId: string, email: string) {
  return getOrSet(
    CACHE_KEYS.userAnalytics(userId),
    () => Promise.all([getUserAnalyticsSnapshot(userId, email), getUsage(userId)]),
    CACHE_TTL_MS.USER_ANALYTICS
  );
}
