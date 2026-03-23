/**
 * Single source of truth for cache TTLs (ms) and logical key names.
 * Aligns with docs/PRODUCTION_CHECKLIST.md §11 / §15.
 */
export const CACHE_TTL_MS = {
  /** Owner control center live snapshot (global) */
  CONTROL_CENTER_LIVE: 12_000,
  /** User analytics page bundle (snapshot + usage) */
  USER_ANALYTICS: 90_000,
  /** Main user dashboard home (reports, usage events, etc.) */
  DASHBOARD_HOME: 45_000,
  /** Revenue / growth style aggregates (when used) */
  REVENUE: 60_000,
  GROWTH: 120_000,
} as const;

export const CACHE_KEYS = {
  controlCenterLive: "control-center:live",
  userAnalytics: (userId: string) => `analytics:${userId}`,
} as const;
