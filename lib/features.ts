/**
 * Feature flags by plan. Used for gating AI tools, calculators, CRM, audits.
 * Plan comes from user's DB record (User.plan.name); use getCurrentUser + plan lookup when needed.
 */

import { planNameToKey, getPlanConfig, type PlanKey } from "@/lib/plans";

/** User-like shape with optional plan name (from DB). */
export interface UserWithPlan {
  plan?: { name: string } | null;
}

/**
 * Whether the user's plan allows AI tools (e.g. copy, audit, funnel).
 */
export function canUseAiTools(user: UserWithPlan | null): boolean {
  if (!user) return false;
  const key = planNameToKey(user.plan?.name);
  return getPlanConfig(key).features.aiTools;
}

/**
 * Whether the user's plan allows calculators.
 */
export function canUseCalculators(user: UserWithPlan | null): boolean {
  if (!user) return false;
  const key = planNameToKey(user.plan?.name);
  return getPlanConfig(key).features.calculators;
}

/**
 * Whether the user's plan allows CRM (clients, projects).
 */
export function canUseCrm(user: UserWithPlan | null): boolean {
  if (!user) return false;
  const key = planNameToKey(user.plan?.name);
  return getPlanConfig(key).features.crm;
}

/**
 * Whether the user's plan allows audits (website audit).
 */
export function canUseAudits(user: UserWithPlan | null): boolean {
  if (!user) return false;
  const key = planNameToKey(user.plan?.name);
  return getPlanConfig(key).features.audits;
}

/**
 * Get all feature flags for a plan key (e.g. for admin or display).
 */
export function getFeaturesForPlan(planKey: PlanKey) {
  return getPlanConfig(planKey).features;
}
