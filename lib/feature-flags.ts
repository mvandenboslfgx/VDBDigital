import { isCanary } from "@/lib/release-mode";

/**
 * Static defaults. Enable gradually via:
 * - Vercel env: FEATURE_FLAG_* = true|false
 * - Or set a flag to `true` here and gate with `isCanary()` in `isFeatureEnabled`.
 */
export const FLAGS = {
  newDashboard: false,
  aiAutopilotV2: false,
} as const;

export type FeatureFlagKey = keyof typeof FLAGS;

const ENV_NAMES: Record<FeatureFlagKey, string> = {
  newDashboard: "FEATURE_FLAG_NEW_DASHBOARD",
  aiAutopilotV2: "FEATURE_FLAG_AI_AUTOPILOT_V2",
};

/**
 * Feature on if: env forces true, or (FLAGS[key] && canary), or env not set and FLAGS true in production (future).
 */
export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  const envName = ENV_NAMES[key];
  const raw = process.env[envName];
  if (raw === "true") return true;
  if (raw === "false") return false;

  if (!FLAGS[key]) return false;
  return isCanary();
}

/** Percentage rollout 0–100; deterministic per `seed` (e.g. user id). */
export function isInRolloutPercent(percent: number, seed: string): boolean {
  if (percent >= 100) return true;
  if (percent <= 0) return false;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bucket = (h % 10000) / 100;
  return bucket < percent;
}

/**
 * Globale rollout uit Vercel env, bv. `RELEASE_ROLLOUT_PERCENT=25` (0–100).
 * Gebruik met `isInRolloutPercent(getGlobalRolloutPercent(), userId)`.
 */
export function getGlobalRolloutPercent(): number {
  const raw = process.env.RELEASE_ROLLOUT_PERCENT?.trim();
  if (!raw) return 100;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 100;
  return Math.min(100, Math.max(0, n));
}

/**
 * Niet-deterministisch per request — alleen voor low-risk experimenten.
 * Voor productie: gebruik `isInRolloutPercent` met user-id.
 */
export function isInRandomRolloutSample(percent: number): boolean {
  if (percent >= 100) return true;
  if (percent <= 0) return false;
  return Math.random() * 100 < percent;
}
