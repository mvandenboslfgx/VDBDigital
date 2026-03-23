import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { triggerRollback } from "@/lib/release/auto-rollback";
import type { IncidentSeverity } from "@/lib/release/incidents";
import { z } from "zod";

function extractWebhookSecret(request: Request): string | null {
  const auth = request.headers.get("authorization") ?? "";
  const x = request.headers.get("x-webhook-secret") ?? "";
  const bearerPrefix = "Bearer ";
  if (auth.startsWith(bearerPrefix)) return auth.slice(bearerPrefix.length).trim();
  if (x) return x.trim();
  return null;
}

const SentryAlertBodySchema = z.object({
  errorRatePercent: z.preprocess(
    (v) => (typeof v === "string" ? Number(v) : v),
    z.number().min(0).max(100)
  ).optional(),
  fatal: z.boolean().optional(),
  reason: z.string().max(400).optional(),
  deploymentId: z.string().max(200).nullable().optional(),
  errorSummary: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const secret = process.env.SELF_HEALING_SENTRY_ALERT_SECRET?.trim();
  if (!secret) {
    logger.error("[selfheal][sentry-alert] SELF_HEALING_SENTRY_ALERT_SECRET not set");
    return NextResponse.json({ ok: false, message: "Sentry alert endpoint not configured" }, { status: 503 });
  }

  const provided = extractWebhookSecret(request);
  if (!provided || provided !== secret) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = SentryAlertBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const body = parsed.data;

    const threshold = Number.parseFloat(
      process.env.SELF_HEALING_ERROR_RATE_THRESHOLD_PERCENT ?? "5"
    );
    const errorRatePercent = body.errorRatePercent ?? null;
    const fatal = body.fatal === true;

    const shouldRollback =
      fatal ||
      (errorRatePercent != null &&
        Number.isFinite(threshold) &&
        errorRatePercent >= threshold);

    if (!shouldRollback) {
      return NextResponse.json({ ok: true, skipped: true, shouldRollback: false });
    }

    const reasonParts = [
      body.reason ?? "Sentry detected error spike",
      errorRatePercent != null ? `errorRate=${errorRatePercent}%` : undefined,
      fatal ? "fatal=true" : undefined,
    ].filter(Boolean);

    const severity: IncidentSeverity = "critical";

    await triggerRollback({
      reason: reasonParts.join(" | "),
      severity,
      source: "sentry",
      errorSummary: body.errorSummary,
    });

    return NextResponse.json({ ok: true, skipped: false });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }
}

