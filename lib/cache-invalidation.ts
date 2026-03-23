/**
 * Event-driven cache invalidation — call after writes that affect dashboards / control center.
 */
import { invalidateCache, dashboardCacheKey } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-policy";

export async function invalidateControlCenterLive(): Promise<void> {
  await invalidateCache(CACHE_KEYS.controlCenterLive);
}

export async function invalidateUserDashboardCaches(userId: string): Promise<void> {
  await Promise.all([
    invalidateCache(CACHE_KEYS.userAnalytics(userId)),
    invalidateCache(dashboardCacheKey(userId)),
  ]);
}

/**
 * After platform-wide or user activity: refresh owner control center + optional user dashboards.
 */
export async function onPlatformActivity(options: { userId?: string | null; reason?: string }): Promise<void> {
  await invalidateControlCenterLive();
  if (options.userId) {
    await invalidateUserDashboardCaches(options.userId);
  }
}
