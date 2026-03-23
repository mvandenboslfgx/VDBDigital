/**
 * Owner control center payload — shared by SSR page + GET /api/admin/control-center/live (cached).
 */
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/siteUrl";
import { getOrSet } from "@/lib/cache";
import { CACHE_TTL_MS, CACHE_KEYS } from "@/lib/cache-policy";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function estimateAiCostFromTokens(tokens: number): number {
  return (tokens / 1000) * 0.002;
}

export type ActivityItem =
  | { type: "scan"; id: string; domain: string; score?: number; createdAt: string }
  | { type: "user"; id: string; email: string; plan?: string; createdAt: string }
  | { type: "payment"; id: string; amount: number; email?: string; createdAt: string }
  | { type: "ai"; id: string; tool: string; createdAt: string }
  | { type: "lead"; id: string; email: string; source: string; createdAt: string };

export interface ControlCenterLiveData {
  activeUsers: number;
  scansToday: number;
  reportsToday: number;
  revenueToday: number;
  revenueMonth: number;
  mrr: number;
  aiRequestsToday: number;
  aiTokensToday: number | null;
  aiCostToday: number;
  newUsersToday: number;
  newLeadsToday: number;
  platformStatus: "ok" | "warning" | "error";
  activity: ActivityItem[];
  timestamp: string;
}

async function buildControlCenterLiveDataUncached(): Promise<ControlCenterLiveData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    scansToday,
    newUsersToday,
    newLeadsToday,
    aiUsageToday,
    paidInvoicesToday,
    paidInvoicesMonth,
    usersWithPlan,
    recentReports,
    recentUsers,
    recentInvoices,
    recentAiUsage,
    recentLeads,
    healthData,
  ] = await Promise.all([
    prisma.user.count({ where: { disabledAt: null } }),
    prisma.auditReport.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.aIUsage.aggregate({
      where: { createdAt: { gte: todayStart } },
      _count: true,
      _sum: { tokens: true },
    }),
    prisma.invoice.findMany({
      where: { status: "paid", createdAt: { gte: todayStart } },
      select: { amount: true, id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.invoice.findMany({
      where: { status: "paid", createdAt: { gte: startOfMonth } },
      select: { amount: true },
    }),
    prisma.user.findMany({
      where: { stripeSubscriptionId: { not: null }, planId: { not: null }, disabledAt: null },
      select: { plan: { select: { price: true } } },
    }),
    prisma.auditReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        url: true,
        seoScore: true,
        perfScore: true,
        uxScore: true,
        convScore: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, email: true, createdAt: true, plan: { select: { name: true } } },
    }),
    prisma.invoice.findMany({
      where: { status: "paid" },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, amount: true, createdAt: true, client: { select: { email: true } } },
    }),
    prisma.aIUsage.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, tool: true, createdAt: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, source: true, createdAt: true },
    }),
    fetch(`${getBaseUrl()}/api/health`, { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => ({ database: "error", stripe: "error" })),
  ]);

  const mrrCents = usersWithPlan.reduce((sum, u) => sum + (u.plan?.price ?? 0), 0);
  const mrrEur = mrrCents / 100;
  const revenueTodayCents = paidInvoicesToday.reduce((s, i) => s + i.amount, 0);
  const revenueMonthCents = paidInvoicesMonth.reduce((s, i) => s + i.amount, 0);
  const aiCostToday = aiUsageToday._sum.tokens
    ? estimateAiCostFromTokens(aiUsageToday._sum.tokens)
    : 0;
  const platformStatus: "ok" | "warning" | "error" =
    healthData?.database === "ok" && healthData?.stripe !== "error"
      ? "ok"
      : healthData?.database === "ok"
        ? "warning"
        : "error";

  const activity: ActivityItem[] = [
    ...recentReports.map((r) => {
      const domain = r.url.replace(/^https?:\/\//, "").split("/")[0];
      const score = Math.round(
        (r.seoScore + r.perfScore + r.uxScore + r.convScore) / 4
      );
      return {
        type: "scan" as const,
        id: r.id,
        domain,
        score,
        createdAt: r.createdAt.toISOString(),
      };
    }),
    ...recentUsers.map((u) => ({
      type: "user" as const,
      id: u.id,
      email: u.email,
      plan: u.plan?.name ?? "Free",
      createdAt: u.createdAt.toISOString(),
    })),
    ...recentInvoices.map((i) => ({
      type: "payment" as const,
      id: i.id,
      amount: i.amount / 100,
      email: i.client?.email,
      createdAt: i.createdAt.toISOString(),
    })),
    ...recentAiUsage.map((a) => ({
      type: "ai" as const,
      id: a.id,
      tool: a.tool,
      createdAt: a.createdAt.toISOString(),
    })),
    ...recentLeads.map((l) => ({
      type: "lead" as const,
      id: l.id,
      email: l.email,
      source: l.source,
      createdAt: l.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  return {
    activeUsers: totalUsers,
    scansToday,
    reportsToday: scansToday,
    revenueToday: revenueTodayCents / 100,
    revenueMonth: revenueMonthCents / 100,
    mrr: mrrEur,
    aiRequestsToday: aiUsageToday._count,
    aiTokensToday: aiUsageToday._sum.tokens,
    aiCostToday,
    newUsersToday,
    newLeadsToday,
    platformStatus,
    activity,
    timestamp: now.toISOString(),
  };
}

/** Cached snapshot for SSR + API (short TTL — balances load vs freshness). */
export async function getControlCenterLiveData(): Promise<ControlCenterLiveData> {
  return getOrSet(
    CACHE_KEYS.controlCenterLive,
    buildControlCenterLiveDataUncached,
    CACHE_TTL_MS.CONTROL_CENTER_LIVE
  );
}
