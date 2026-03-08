import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMonthlyAuditLimit } from "@/lib/audit-limits";
import { getPlanConfigByPlanName } from "@/lib/plans";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      auditCountCurrentMonth: true,
      lastAuditResetAt: true,
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
        lead: { email: user.email },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.aIUsage.count({
      where: {
        userId: user.id,
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  const scansUsed = dbUser?.auditCountCurrentMonth ?? 0;

  return NextResponse.json({
    stats: {
      scansUsed,
      scansLimit,
      reportsGenerated: reportsCount,
      aiUsage: aiUsageCount,
      aiLimit: planConfig.aiLimit === Infinity ? null : planConfig.aiLimit,
    },
  });
}
