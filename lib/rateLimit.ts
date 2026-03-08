/**
 * Rate limiting: in-memory by default, structured for optional Redis (e.g. Upstash).
 * Use for: AI tools, auth endpoints, public/sensitive APIs.
 * Keys include IP and optionally userId. Logs triggers for security.
 */
import { logger } from "@/lib/logger";

const WINDOW_MS = 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 min after 5 failed logins
const FAILED_LOGIN_MAX = 5;

export const MAX_REQUESTS_GENERAL = 60;
export const AUTH_MAX_PER_MINUTE = 10;
export const AI_MAX_PER_MINUTE = 20;
export const REGISTRATION_MAX_PER_MINUTE = 5;
export const SENSITIVE_ENDPOINT_MAX = 20;

/** Entry for a rate limit window. */
export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Pluggable store for rate limit state. Replace with Redis adapter for multi-instance.
 * In-memory implementation is default; for production at scale use e.g. Upstash Redis.
 */
export interface RateLimitStore {
  get(key: string): RateLimitEntry | null;
  set(key: string, entry: RateLimitEntry, ttlMs: number): void;
}

/** Pluggable store for login lockout state. */
export interface LockoutStore {
  get(key: string): number | null;
  set(key: string, untilTimestamp: number, ttlMs: number): void;
}

/** In-memory rate limit store (default). Per-instance; use Redis for distributed. */
function createMemoryLimitStore(): RateLimitStore {
  const store = new Map<string, RateLimitEntry>();
  return {
    get(key: string) {
      return store.get(key) ?? null;
    },
    set(key: string, entry: RateLimitEntry, _ttlMs: number) {
      store.set(key, entry);
    },
  };
}

/** In-memory lockout store. */
function createMemoryLockoutStore(): LockoutStore {
  const store = new Map<string, number>();
  return {
    get(key: string) {
      return store.get(key) ?? null;
    },
    set(key: string, until: number, _ttlMs: number) {
      store.set(key, until);
    },
  };
}

const memoryLimitStore = createMemoryLimitStore();
const memoryLockoutStore = createMemoryLockoutStore();

let limitStore: RateLimitStore = memoryLimitStore;
let lockoutStoreImpl: LockoutStore = memoryLockoutStore;

/** Swap rate limit store (e.g. Redis). Call at startup. */
export function setRateLimitStore(store: RateLimitStore): void {
  limitStore = store;
}

/** Swap lockout store (e.g. Redis). Call at startup. */
export function setLockoutStore(store: LockoutStore): void {
  lockoutStoreImpl = store;
}

function rateLimitInternal(
  key: string,
  max: number,
  logLabel: string
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = limitStore.get(key);
  if (!entry) {
    limitStore.set(key, { count: 1, resetAt: now + WINDOW_MS }, WINDOW_MS);
    return { ok: true, remaining: max - 1 };
  }
  if (now > entry.resetAt) {
    limitStore.set(key, { count: 1, resetAt: now + WINDOW_MS }, WINDOW_MS);
    return { ok: true, remaining: max - 1 };
  }
  const newCount = entry.count + 1;
  limitStore.set(key, { count: newCount, resetAt: entry.resetAt }, entry.resetAt - now);
  const remaining = Math.max(0, max - newCount);
  const ok = newCount <= max;
  if (!ok) {
    logger.warn("[Security] Rate limit triggered", { label: logLabel, key: key.slice(0, 60) });
  }
  return { ok, remaining };
}

export function rateLimit(key: string): { ok: boolean; remaining: number } {
  return rateLimitInternal(key, MAX_REQUESTS_GENERAL, "general");
}

export function rateLimitAuth(key: string): { ok: boolean; remaining: number } {
  return rateLimitInternal(key, AUTH_MAX_PER_MINUTE, "auth");
}

export function rateLimitRegistration(key: string): { ok: boolean; remaining: number } {
  return rateLimitInternal(key, REGISTRATION_MAX_PER_MINUTE, "registration");
}

export function rateLimitSensitive(key: string): { ok: boolean; remaining: number } {
  return rateLimitInternal(key, SENSITIVE_ENDPOINT_MAX, "sensitive");
}

export const AUDIT_MAX_PER_MINUTE = 10;
/** 10 scans per hour per IP for audit endpoint. */
export const AUDIT_MAX_PER_HOUR = 10;

const auditHourStore = new Map<string, RateLimitEntry>();

function rateLimitWithWindow(
  key: string,
  max: number,
  windowMs: number,
  logLabel: string
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = auditHourStore.get(key);
  if (!entry) {
    auditHourStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (now > entry.resetAt) {
    auditHourStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  const newCount = entry.count + 1;
  auditHourStore.set(key, { count: newCount, resetAt: entry.resetAt });
  const remaining = Math.max(0, max - newCount);
  const ok = newCount <= max;
  if (!ok) logger.warn("[Security] Rate limit triggered", { label: logLabel, key: key.slice(0, 60) });
  return { ok, remaining };
}

export function rateLimitAudit(key: string): { ok: boolean; remaining: number } {
  return rateLimitInternal(key, AUDIT_MAX_PER_MINUTE, "audit");
}

/** 10 scans per hour per key (use getClientKey(request) for IP). */
export function rateLimitAuditPerHour(key: string): { ok: boolean; remaining: number } {
  return rateLimitWithWindow(key, AUDIT_MAX_PER_HOUR, HOUR_MS, "audit-hour");
}

export function rateLimitAi(key: string): { ok: boolean; remaining: number } {
  return rateLimitInternal(key, AI_MAX_PER_MINUTE, "ai");
}

export function getClientKey(request: Request): string {
  const forwarded =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";
  const ip = forwarded.split(",")[0].trim() || "anonymous";
  return ip;
}

/** Build rate limit key: IP + optional userId for authenticated routes. */
export function getRateLimitKey(request: Request, userId?: string | null): string {
  const ip = getClientKey(request);
  return userId ? `${ip}:${userId}` : ip;
}

/** Failed login tracking: after 5 failures from IP, lock out for 15 min. */
export function recordFailedLogin(ipKey: string): void {
  const key = `failed:${ipKey}`;
  const entry = limitStore.get(key);
  const now = Date.now();
  if (!entry) {
    limitStore.set(key, { count: 1, resetAt: now + WINDOW_MS }, WINDOW_MS);
    return;
  }
  if (now > entry.resetAt) {
    limitStore.set(key, { count: 1, resetAt: now + WINDOW_MS }, WINDOW_MS);
    return;
  }
  entry.count += 1;
  limitStore.set(key, entry, entry.resetAt - now);
  if (entry.count >= FAILED_LOGIN_MAX) {
    lockoutStoreImpl.set(ipKey, now + LOCKOUT_MS, LOCKOUT_MS);
    logger.warn("[Security] Login lockout triggered", { key: ipKey.slice(0, 40) });
  }
}

export function isLoginLockedOut(ipKey: string): boolean {
  const until = lockoutStoreImpl.get(ipKey);
  if (!until) return false;
  if (Date.now() > until) {
    return false;
  }
  return true;
}
