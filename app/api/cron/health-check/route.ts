import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { triggerRollback } from "@/lib/release/auto-rollback";
import {
  addIncident,
  incrementHealthFailCount,
  resetHealthFailCount,
  shouldTriggerRollbackFromHealthFailCount,
} from "@/lib/release/incidents";
import { detectIncidentFromHealth } from "@/lib/release/incident-detector";

function getOrigin(): string {
  const url = process.env.VERCEL_URL?.trim();
  if (url) return `https://${url}`;
  const port = process.env.PORT ?? "3000";
  return `http://127.0.0.1:${port}`;
}

function getCronAuthHeader(request: Request): string | null {
  return request.headers.get("authorization");
}

function getHealthHeaders(): Record<string, string> {
  const secret = process.env.HEALTHCHECK_SECRET?.trim();
  if (!secret) return {};
  return { "x-health-secret": secret };
}

async function fetchHealth(origin: string): Promise<{ httpStatus: number; body: any | null }> {
  const url = `${origin}/api/health`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6_000);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: getHealthHeaders(),
      cache: "no-store",
      signal: ctrl.signal,
    });

    let json: any | null = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { httpStatus: res.status, body: json };
  } finally {
    clearTimeout(t);
  }
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    logger.error("[selfheal][cron] CRON_SECRET not set");
    return NextResponse.json({ ok: false, message: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = getCronAuthHeader(request);
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const origin = getOrigin();
  const { httpStatus, body } = await fetchHealth(origin);

  // Rate limit on health endpoint should not trigger rollbacks.
  if (httpStatus === 429) {
    return NextResponse.json({ ok: true, skipped: "rate_limited" });
  }

  const healthStatus = body?.status;
  const healthLike = {
    status: healthStatus,
    database: body?.database,
    stripe: body?.stripe,
    ai: body?.ai,
  };

  if (httpStatus === 200 && healthLike.status === "ok") {
    await resetHealthFailCount();
    return NextResponse.json({ ok: true, health: healthLike, failCount: 0 });
  }

  const failCount = await incrementHealthFailCount();
  logger.warn("[selfheal][cron] Health degraded; increment fail counter", { failCount, httpStatus, health: healthLike });

  // Log the failure every time (governance + later analysis)
  await addIncident({
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
    reason: `Health-check failure (http=${httpStatus}, status=${healthLike.status})`,
    severity: "medium",
    source: "health",
    errorSummary: body ? JSON.stringify({ database: body.database, stripe: body.stripe, ai: body.ai }).slice(0, 400) : undefined,
  });

  if (!(await shouldTriggerRollbackFromHealthFailCount(failCount))) {
    return NextResponse.json({ ok: true, health: healthLike, failCount });
  }

  const detected = detectIncidentFromHealth(healthLike as any, httpStatus);
  if (!detected) {
    // Should not happen (we only trigger on degraded)
    return NextResponse.json({ ok: true, health: healthLike, failCount });
  }

  await triggerRollback({
    reason: detected.reason,
    severity: detected.severity,
    source: detected.source,
    errorSummary: detected.errorSummary,
  });

  await resetHealthFailCount();

  return NextResponse.json({ ok: true, health: healthLike, failCount, rollbackTriggered: true });
}

