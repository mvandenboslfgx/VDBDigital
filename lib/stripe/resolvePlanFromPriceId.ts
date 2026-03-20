/**
 * Resolve Plan and role from Stripe price ID. Single source of truth for webhook handlers.
 * Plans are cached to avoid N+1 on webhook bursts.
 */

import { prisma } from "@/lib/prisma";

export interface ResolvedPlan {
  planId: string;
  planName: "starter" | "growth" | "agency";
  role: "pro" | "customer";
}

let plansCache: Awaited<ReturnType<typeof prisma.plan.findMany>> | null = null;

async function getPlans() {
  if (plansCache) return plansCache;
  plansCache = await prisma.plan.findMany({
    where: { name: { in: ["starter", "growth", "agency", "pro", "business"] } },
  });
  return plansCache;
}

/**
 * Returns planId, planName, and role for the given Stripe price ID.
 * Agency → customer role; starter/growth → pro role.
 * Supports STRIPE_PRICE_ID_STARTER, _GROWTH, _AGENCY (and legacy _PRO, _BUSINESS).
 * Empty/missing priceId → null. Known priceId with no matching env mapping → throws (fail-fast).
 */
export async function resolvePlanFromPriceId(
  priceId: string | null | undefined
): Promise<ResolvedPlan | null> {
  const id = typeof priceId === "string" ? priceId.trim() : "";
  if (!id) return null;

  const env = process.env;
  const plans = await getPlans();
  const starterPlan =
    plans.find((p) => p.name === "starter") ?? plans.find((p) => p.name === "pro");
  const growthPlan = plans.find((p) => p.name === "growth") ?? plans.find((p) => p.name === "business");
  const agencyPlan = plans.find((p) => p.name === "agency");

  if (id === env.STRIPE_PRICE_ID_AGENCY && agencyPlan) {
    return { planId: agencyPlan.id, planName: "agency", role: "customer" };
  }
  if ((id === env.STRIPE_PRICE_ID_GROWTH || id === env.STRIPE_PRICE_ID_BUSINESS) && growthPlan) {
    return { planId: growthPlan.id, planName: "growth", role: "pro" };
  }
  if ((id === env.STRIPE_PRICE_ID_STARTER || id === env.STRIPE_PRICE_ID_PRO) && starterPlan) {
    return { planId: starterPlan.id, planName: "starter", role: "pro" };
  }
  throw new Error(`Unknown Stripe priceId: ${id}`);
}
