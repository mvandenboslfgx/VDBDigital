/**
 * Per-plan monthly audit limits for the SaaS lead machine.
 */

import { prisma } from "@/lib/prisma";

const FREE_AUDITS_PER_MONTH = 1;
const STARTER_AUDITS_PER_MONTH = 10;
const PRO_AUDITS_PER_MONTH = 50;
const AGENCY_AUDITS_PER_MONTH = Infinity;

export function getMonthlyAuditLimit(planName: string | null): number | null {
  if (!planName) return FREE_AUDITS_PER_MONTH;
  const name = planName.toLowerCase();
  if (name === "agency") return AGENCY_AUDITS_PER_MONTH;
  if (name === "growth" || name === "pro") return PRO_AUDITS_PER_MONTH;
  if (name === "starter" || name === "business") return STARTER_AUDITS_PER_MONTH;
  if (name === "free") return FREE_AUDITS_PER_MONTH;
  return FREE_AUDITS_PER_MONTH;
}

export async function getAndEnsureCurrentMonthCount(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { auditCountCurrentMonth: true, lastAuditResetAt: true },
  });
  if (!user) return 0;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
  const lastReset = user.lastAuditResetAt;
  const lastMonth = lastReset ? `${lastReset.getFullYear()}-${lastReset.getMonth()}` : null;
  if (lastMonth !== currentMonth) {
    await prisma.user.update({
      where: { id: userId },
      data: { auditCountCurrentMonth: 0, lastAuditResetAt: now },
    });
    return 0;
  }
  return user.auditCountCurrentMonth;
}

export async function incrementAuditCount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { auditCountCurrentMonth: true, lastAuditResetAt: true },
  });
  if (!user) return;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
  const lastReset = user.lastAuditResetAt;
  const lastMonth = lastReset ? `${lastReset.getFullYear()}-${lastReset.getMonth()}` : null;
  const newCount = lastMonth !== currentMonth ? 1 : user.auditCountCurrentMonth + 1;
  await prisma.user.update({
    where: { id: userId },
    data: {
      auditCountCurrentMonth: newCount,
      lastAuditResetAt: lastMonth !== currentMonth ? now : undefined,
    },
  });
}
