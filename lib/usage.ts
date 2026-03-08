/**
 * Usage tracking and limit checks for SaaS billing.
 * AI tools, calculators, and projects are counted per user; limits come from lib/plans.
 */

import { prisma } from "@/lib/prisma";
import {
  type PlanKey,
  planNameToKey,
  getPlanConfig,
  type PlanConfig,
} from "@/lib/plans";
import { logger } from "@/lib/logger";

export interface UsageSnapshot {
  aiUsage: number;
  calculatorUsage: number;
  projectCount: number;
}

/** Start of current month (UTC) for usage windows. */
function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Get current month usage for a user.
 * - AI: count of AIUsage rows this month.
 * - Calculators: count of CalculatorResult rows this month.
 * - Projects: count of Project where client.userId = userId.
 */
export async function getUsage(userId: string): Promise<UsageSnapshot> {
  const start = startOfCurrentMonth();

  const [aiUsage, calculatorUsage, clientWithProjects] = await Promise.all([
    prisma.aIUsage.count({
      where: {
        userId,
        createdAt: { gte: start },
      },
    }),
    prisma.calculatorResult.count({
      where: {
        userId,
        createdAt: { gte: start },
      },
    }),
    prisma.client.findFirst({
      where: { userId },
      select: { id: true },
    }),
  ]);

  let projectCount = 0;
  if (clientWithProjects) {
    projectCount = await prisma.project.count({
      where: { clientId: clientWithProjects.id },
    });
  }

  return {
    aiUsage,
    calculatorUsage,
    projectCount,
  };
}

export interface UsageLimitCheck {
  allowed: boolean;
  usage: UsageSnapshot;
  limits: PlanConfig;
  planKey: PlanKey;
  /** Which limit was exceeded, if any. */
  exceeded?: "ai" | "calculator" | "projects";
}

/**
 * Check if the user is within their plan limits.
 * Fetches user's plan from DB and compares usage to PLANS config.
 */
export async function checkUsageLimit(userId: string): Promise<UsageLimitCheck> {
  const [user, usage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: { select: { name: true } } },
    }),
    getUsage(userId),
  ]);

  const planName = user?.plan?.name ?? null;
  const planKey = planNameToKey(planName);
  const limits = getPlanConfig(planKey);

  const aiOk =
    limits.aiLimit === Infinity || usage.aiUsage < limits.aiLimit;
  const calcOk =
    limits.calculatorLimit === Infinity ||
    usage.calculatorUsage < limits.calculatorLimit;
  const projectOk =
    limits.projects === Infinity || usage.projectCount < limits.projects;

  let exceeded: "ai" | "calculator" | "projects" | undefined;
  if (!aiOk) exceeded = "ai";
  else if (!calcOk) exceeded = "calculator";
  else if (!projectOk) exceeded = "projects";

  return {
    allowed: aiOk && calcOk && projectOk,
    usage,
    limits,
    planKey,
    exceeded,
  };
}

/**
 * Record one AI tool usage for the user (for limit counting).
 * Call this when an AI tool is used; getUsage counts AIUsage rows this month.
 */
export async function incrementAiUsage(
  userId: string,
  tool: string = "unknown"
): Promise<void> {
  try {
    await prisma.aIUsage.create({
      data: {
        userId,
        tool,
      },
    });
    const { auditAiToolUsed } = await import("@/lib/auditLog");
    void auditAiToolUsed(userId, tool);
  } catch (e) {
    logger.warn("[Usage] incrementAiUsage failed", { userId, tool, error: String(e) });
  }
}

/**
 * Calculator usage is derived from CalculatorResult count (see getUsage).
 * Call recordCalculatorResult when the user runs a calculator; no separate increment needed.
 * This helper exists for API consistency and future use.
 */
export async function incrementCalculatorUsage(_userId: string): Promise<void> {
  // No-op: usage = count(CalculatorResult) this month
}
