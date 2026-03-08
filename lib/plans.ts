/**
 * Plan (monetization) helpers and central plan configuration.
 * Dashboard and usage limits read from PLANS; Stripe syncs User.planId to DB Plan records.
 */

import { prisma } from "@/lib/prisma";

/** Plan key used in code. DB Plan.name: free | starter | growth | agency */
export type PlanKey = "free" | "starter" | "growth" | "agency";

export interface PlanFeatureFlags {
  aiTools: boolean;
  calculators: boolean;
  crm: boolean;
  audits: boolean;
}

export interface PlanConfig {
  /** Display name. */
  name: string;
  /** Monthly price in euros (0 = free). */
  monthlyPrice: number;
  /** Scans (audits) per month. */
  scansPerMonth: number;
  /** AI usage limit per month (calls). Infinity = unlimited. */
  aiLimit: number;
  /** Calculator usage limit per month. Infinity = unlimited. */
  calculatorLimit: number;
  /** Max projects. Infinity = unlimited. */
  projects: number;
  features: PlanFeatureFlags;
}

/** Central plan configuration. Free 1, Starter 10, Pro 50, Agency unlimited audits/month. */
export const PLANS: Record<PlanKey, PlanConfig> = {
  free: {
    name: "Gratis",
    monthlyPrice: 0,
    scansPerMonth: 1,
    aiLimit: 0,
    calculatorLimit: 10,
    projects: 1,
    features: {
      aiTools: false,
      calculators: true,
      crm: false,
      audits: true,
    },
  },
  starter: {
    name: "Starter",
    monthlyPrice: 29,
    scansPerMonth: 10,
    aiLimit: 100,
    calculatorLimit: 200,
    projects: 5,
    features: {
      aiTools: true,
      calculators: true,
      crm: false,
      audits: true,
    },
  },
  growth: {
    name: "Pro",
    monthlyPrice: 79,
    scansPerMonth: 50,
    aiLimit: 500,
    calculatorLimit: 500,
    projects: 15,
    features: {
      aiTools: true,
      calculators: true,
      crm: false,
      audits: true,
    },
  },
  agency: {
    name: "Agency",
    monthlyPrice: 199,
    scansPerMonth: Infinity,
    aiLimit: Infinity,
    calculatorLimit: Infinity,
    projects: Infinity,
    features: {
      aiTools: true,
      calculators: true,
      crm: true,
      audits: true,
    },
  },
};

/** Map DB plan name to PlanKey. */
export function planNameToKey(planName: string | null | undefined): PlanKey {
  if (!planName) return "free";
  const name = planName.toLowerCase();
  if (name === "agency") return "agency";
  if (name === "growth") return "growth";
  if (name === "starter") return "starter";
  if (name === "pro" || name === "business") return "starter"; // legacy
  return "free";
}

/** Get plan config by key. */
export function getPlanConfig(key: PlanKey): PlanConfig {
  return PLANS[key];
}

/** Get plan config for a user from DB plan name. */
export function getPlanConfigByPlanName(planName: string | null | undefined): PlanConfig {
  return PLANS[planNameToKey(planName)];
}

export interface PlanPublic {
  id: string;
  name: string;
  price: number;
  credits: number | null;
  features: Record<string, unknown>;
}

export async function getActivePlans(): Promise<PlanPublic[]> {
  const rows = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    credits: p.credits,
    features: (p.features as Record<string, unknown>) ?? {},
  }));
}

export async function getPlanById(id: string): Promise<PlanPublic | null> {
  const plan = await prisma.plan.findUnique({
    where: { id, active: true },
  });
  if (!plan) return null;
  return {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    credits: plan.credits,
    features: (plan.features as Record<string, unknown>) ?? {},
  };
}
