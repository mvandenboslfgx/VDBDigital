import { redisDel, redisGet, redisIncr, redisSet } from "@/lib/redis";
import { logger } from "@/lib/logger";

export type IncidentSeverity = "low" | "medium" | "critical";
export type IncidentSource = "health" | "sentry" | "manual" | "other";

export interface Incident {
  timestamp: string;
  deploymentId: string | null;
  reason: string;
  severity: IncidentSeverity;
  source: IncidentSource;
  errorSummary?: string;
}

// Redis-backed state (preferred) with in-memory fallback.
const KEYS = {
  rollbackLastAtMs: "vdb:release:selfheal:lastRollbackAtMs",
  rollbackLastDeploymentId: "vdb:release:selfheal:lastRollbackDeploymentId",
  healthFailCount: "vdb:release:selfheal:healthFailCount",
  incidentsList: "vdb:release:selfheal:incidents", // stored via direct Redis list ops when possible
};

const ROLLBACK_COOLDOWN_MS = 10 * 60 * 1000; // max 1 rollback per 10 minutes
const HEALTH_FAIL_THRESHOLD = 2; // trigger rollback on N consecutive failures
const HEALTH_FAIL_TTL_SECONDS = 180; // ~3 minutes window to accumulate failures

let memoryIncidents: Incident[] = [];
let memoryLastRollbackAtMs: number | null = null;
let memoryLastRollbackDeploymentId: string | null = null;
let memoryHealthFailCount = 0;

function nowIso() {
  return new Date().toISOString();
}

export function getRollbackCooldownMs() {
  return ROLLBACK_COOLDOWN_MS;
}

export function getHealthFailThreshold() {
  return HEALTH_FAIL_THRESHOLD;
}

export function getHealthFailTtlSeconds() {
  return HEALTH_FAIL_TTL_SECONDS;
}

export async function canRollbackForDeployment(deploymentId: string | null): Promise<boolean> {
  if (!deploymentId) return false;

  // Redis guard state first
  const [lastAtRaw, lastDep] = await Promise.all([redisGet(KEYS.rollbackLastAtMs), redisGet(KEYS.rollbackLastDeploymentId)]);
  const lastAtMs = lastAtRaw ? Number.parseInt(lastAtRaw, 10) : NaN;

  const cdOk = Number.isFinite(lastAtMs) ? Date.now() - lastAtMs >= ROLLBACK_COOLDOWN_MS : memoryLastRollbackAtMs == null || Date.now() - memoryLastRollbackAtMs >= ROLLBACK_COOLDOWN_MS;
  const depOk = lastDep ? lastDep !== deploymentId : memoryLastRollbackDeploymentId !== deploymentId;

  if (!cdOk) logger.warn("[selfheal] Rollback cooldown active; skipping", { deploymentId });
  if (!depOk) logger.warn("[selfheal] Same deployment already rolled back recently; skipping", { deploymentId });

  return cdOk && depOk;
}

export async function markRollbackAttempt(deploymentId: string | null): Promise<void> {
  const ts = Date.now();
  memoryLastRollbackAtMs = ts;
  memoryLastRollbackDeploymentId = deploymentId ?? null;

  await redisSet(KEYS.rollbackLastAtMs, String(ts));
  await redisSet(KEYS.rollbackLastDeploymentId, String(deploymentId ?? ""));
}

export async function getHealthFailCount(): Promise<number> {
  const raw = await redisGet(KEYS.healthFailCount);
  if (raw == null) return memoryHealthFailCount;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : memoryHealthFailCount;
}

export async function incrementHealthFailCount(): Promise<number> {
  const n = await redisIncr(KEYS.healthFailCount, HEALTH_FAIL_TTL_SECONDS);
  if (n == null) {
    memoryHealthFailCount += 1;
    return memoryHealthFailCount;
  }
  return n;
}

export async function resetHealthFailCount(): Promise<void> {
  memoryHealthFailCount = 0;
  await redisDel(KEYS.healthFailCount);
}

export async function addIncident(incident: Omit<Incident, "timestamp">): Promise<Incident> {
  const full: Incident = { ...incident, timestamp: nowIso() };

  // Always keep memory for immediate debugging.
  memoryIncidents = [...memoryIncidents, full].slice(-50);

  // Try Redis list append if available via redisSet fallback (minimal).
  // If Redis isn't available, redisSet will just no-op.
  try {
    const key = `vdb:release:selfheal:incident:${Date.now()}`;
    await redisSet(key, JSON.stringify(full), 7 * 24 * 60 * 60); // keep 7 days in Redis
  } catch {
    // ignore
  }

  logger.error("[selfheal][incident] " + full.reason, {
    deploymentId: full.deploymentId,
    severity: full.severity,
    source: full.source,
    errorSummary: full.errorSummary,
  });

  return full;
}

export async function shouldTriggerRollbackFromHealthFailCount(failCount: number): Promise<boolean> {
  return failCount >= HEALTH_FAIL_THRESHOLD;
}

