/**
 * Redis client for cache, rate limiting, and job queue.
 * When REDIS_URL is not set, all operations no-op (fallback to in-memory in cache/rateLimit).
 */

import type Redis from "ioredis";
import { getServerEnv } from "@/lib/env";

let client: Redis | null = null;

function getRedisUrl(): string | undefined {
  return getServerEnv().REDIS_URL?.trim() || undefined;
}

/**
 * Get Redis client. Returns null if REDIS_URL is not set.
 * Call initRedis() once at app startup to connect.
 */
export function getRedis(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;
  if (client) return client;
  try {
    const Redis = require("ioredis") as typeof import("ioredis").default;
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times < 3 ? 1000 : null),
    });
    return client;
  } catch {
    return null;
  }
}

/**
 * Ping Redis (optional startup check). Safe when REDIS_URL is missing.
 */
export async function initRedis(): Promise<Redis | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    await r.ping();
    return r;
  } catch {
    client = null;
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return !!getRedisUrl();
}

/** Get string value. Returns null if key missing or Redis unavailable. */
export async function redisGet(key: string): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    return await r.get(key);
  } catch {
    return null;
  }
}

/** Get multiple string values. Returns nulls for missing keys/unavailable Redis. */
export async function redisMGet(keys: string[]): Promise<(string | null)[]> {
  if (!keys.length) return [];
  const r = getRedis();
  if (!r) return keys.map(() => null);
  try {
    const values = await r.mget(...keys);
    return values.map((v) => (v == null ? null : String(v)));
  } catch {
    return keys.map(() => null);
  }
}

/** Set string value with optional TTL in seconds. */
export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  try {
    if (ttlSeconds != null && ttlSeconds > 0) {
      await r.setex(key, ttlSeconds, value);
    } else {
      await r.set(key, value);
    }
    return true;
  } catch {
    return false;
  }
}

/** Delete key. */
export async function redisDel(key: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  try {
    await r.del(key);
    return true;
  } catch {
    return false;
  }
}

/** Increment key, set expiry on first incr. Returns new count or null. */
export async function redisIncr(key: string, ttlSeconds: number): Promise<number | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, ttlSeconds);
    return count;
  } catch {
    return null;
  }
}

/** Decrement key (rollback / clamp). Returns new count or null. */
export async function redisDecr(key: string): Promise<number | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    return await r.decr(key);
  } catch {
    return null;
  }
}

/**
 * Atomically increment frequency-cap key, set TTL on first use, and roll back if over cap.
 * Avoids a crash gap between separate INCR and DECR.
 * Returns: reserved count (1..cap), or -1 if over cap (rolled back), or null if Redis unavailable.
 */
/** EXPIRE on every successful reservation → sliding window; no stale TTL from first impression. */
const LUA_FREQ_CAP_RESERVE = `
local ttl = tonumber(ARGV[1])
local cap = tonumber(ARGV[2])
local current = redis.call("INCR", KEYS[1])
if current > cap then
  redis.call("DECR", KEYS[1])
  return -1
end
redis.call("EXPIRE", KEYS[1], ttl)
return current
`;

export async function redisFreqCapReserve(
  key: string,
  ttlSeconds: number,
  cap: number
): Promise<number | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    const result = await r.eval(LUA_FREQ_CAP_RESERVE, 1, key, String(ttlSeconds), String(cap));
    if (typeof result === "number") return result;
    if (typeof result === "string") return Number(result);
    return null;
  } catch {
    return null;
  }
}
