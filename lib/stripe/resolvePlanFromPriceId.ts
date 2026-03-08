/**
 * Resolve Plan and role from Stripe price ID. Single source of truth for webhook handlers.
 */

import { prisma } from "@/lib/prisma";

export interface ResolvedPlan {
  planId: string;
  planName: "starter" | "growth" | "agency";
  role: "pro" | "customer";
}

/**
 * Returns planId, planName, and role for the given Stripe price ID.
 * Agency → customer role; starter/growth → pro role.
 * Supports STRIPE_PRICE_ID_STARTER, _GROWTH, _AGENCY (and legacy _PRO, _BUSINESS).
 */
export async function resolvePlanFromPriceId(
  priceId: string
): Promise<ResolvedPlan | null> {
  const env = process.env;
  const plans = await prisma.plan.findMany({
    where: { name: { in: ["starter", "growth", "agency", "pro", "business"] } },
  });
  const starterPlan = plans.find((p) => p.name === "starter") ?? plans.find((p) => p.name === "pro");
  const growthPlan = plans.find((p) => p.name === "growth") ?? plans.find((p) => p.name === "business");
  const agencyPlan = plans.find((p) => p.name === "agency");

  if (priceId === env.STRIPE_PRICE_ID_AGENCY && agencyPlan) {
    return { planId: agencyPlan.id, planName: "agency", role: "customer" };
  }
  if ((priceId === env.STRIPE_PRICE_ID_GROWTH || priceId === env.STRIPE_PRICE_ID_BUSINESS) && growthPlan) {
    return { planId: growthPlan.id, planName: "growth", role: "pro" };
  }
  if ((priceId === env.STRIPE_PRICE_ID_STARTER || priceId === env.STRIPE_PRICE_ID_PRO) && starterPlan) {
    return { planId: starterPlan.id, planName: "starter", role: "pro" };
  }
  if (agencyPlan) return { planId: agencyPlan.id, planName: "agency", role: "customer" };
  if (growthPlan) return { planId: growthPlan.id, planName: "growth", role: "pro" };
  if (starterPlan) return { planId: starterPlan.id, planName: "starter", role: "pro" };
  return null;
}
