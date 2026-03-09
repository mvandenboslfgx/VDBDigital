/**
 * Cache for dashboard analytics, admin metrics, and health checks.
 * Uses Redis when REDIS_URL is set; otherwise in-memory. TTL 30–60 seconds.
 */

import { redisGet, redisSet, isRedisAvailable } from "./redis";

const DEFAULT_TTL_MS = 45_000; // 45 seconds
const CACHE_PREFIX = "vdb:cache:";

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, Entry<unknown>>();

function memoryGet<T>(key: string): T | null {
  const entry = memoryStore.get(key) as Entry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet<T>(key: string, value: T, ttlMs: number): void {
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Return cached value or run fn and cache result. TTL in ms (default 45s).
 * Uses Redis when available; otherwise in-memory.
 */
export async function getOrSet<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const fullKey = CACHE_PREFIX + key;

  if (isRedisAvailable()) {
    try {
      const raw = await redisGet(fullKey);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        if (parsed !== undefined) return parsed;
      }
    } catch {
      // fall through to memory or recompute
    }
  } else {
    const cached = memoryGet<T>(fullKey);
    if (cached !== null) return cached;
  }

  const value = await fn();

  if (isRedisAvailable()) {
    try {
      await redisSet(fullKey, JSON.stringify(value), Math.ceil(ttlMs / 1000));
    } catch {
      memorySet(fullKey, value, ttlMs);
    }
  } else {
    memorySet(fullKey, value, ttlMs);
  }

  return value;
}

/** Cache key for dashboard analytics (per user). */
export function dashboardCacheKey(userId: string): string {
  return `dashboard:${userId}`;
}

/** Cache key for admin metrics (global). */
export const ADMIN_METRICS_CACHE_KEY = "admin:metrics";

/** Cache key for health check. */
export const HEALTH_CACHE_KEY = "health";

/** Cache key for audit result (L1). URL-normalized key. TTL should match or be less than DB cache. */
export function auditResultCacheKey(normalizedUrl: string): string {
  return `audit:result:${normalizedUrl}`;
}
