/**
 * Same numbers as GET /api/usage/stats — shared so the dashboard can render server-side without an extra fetch.
 */
import { prisma } from "@/lib/prisma";
import { getMonthlyAuditLimit } from "@/lib/audit-limits";
import { getPlanConfigByPlanName } from "@/lib/plans";

export type UsageStatsCard = {
  scansUsed: number;
  scansLimit: number | null;
  reportsGenerated: number;
  aiUsage: number;
  aiLimit: number | null;
};

export async function getUsageStatsForDashboard(userId: string, email: string): Promise<UsageStatsCard> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      auditCountCurrentMonth: true,
      plan: { select: { name: true } },
    },
  });

  const planName = dbUser?.plan?.name ?? null;
  const scansLimit = getMonthlyAuditLimit(planName);
  const planConfig = getPlanConfigByPlanName(planName);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [reportsCount, aiUsageCount] = await Promise.all([
    prisma.auditReport.count({
      where: {
        lead: { email },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.aIUsage.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  return {
    scansUsed: dbUser?.auditCountCurrentMonth ?? 0,
    scansLimit,
    reportsGenerated: reportsCount,
    aiUsage: aiUsageCount,
    aiLimit: planConfig.aiLimit === Infinity ? null : planConfig.aiLimit,
  };
}
