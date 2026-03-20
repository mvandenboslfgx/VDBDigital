import { redisIncr } from "@/lib/redis";
import { logger } from "@/lib/logger";

/**
 * Dedupe helper for abuse prevention.
 * - Uses Redis when available (distributed safe).
 * - Falls back to in-memory TTL map when Redis is not configured.
 */

const memory = new Map<string, number>(); // key -> expiresAtMs

export async function dedupeOnce(key: string, ttlSeconds: number): Promise<boolean> {
  const now = Date.now();
  const expiresAt = memory.get(key);
  if (expiresAt && now < expiresAt) return false;

  // Try Redis first for multi-instance safety.
  const incr = await redisIncr(key, ttlSeconds);
  if (incr === null) {
    // Fallback to in-memory: mark first-seen.
    // Important: in fallback mode we still must respect any in-memory expiry
    // to avoid effectively disabling dedupe during transient Redis failures.
    const existing = memory.get(key);
    if (existing && now < existing) return false;

    memory.set(key, now + ttlSeconds * 1000);
    logger.warn("dedupe_fallback_active", { key: key.slice(0, 60) });
    return true;
  }

  return incr === 1;
}

