/**
 * Record usage events for growth analytics.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const ALLOWED_EVENTS = new Set([
  "signup",
  "audit_started",
  "audit_completed",
  "fix_approved",
  "fix_apply_exported",
  "upgrade_clicked",
  "subscription_created",
  "subscription_cancelled",
  "pdf_downloaded",
]);

export async function recordUsageEvent(
  event: string,
  userId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!ALLOWED_EVENTS.has(event)) return;
  try {
    await prisma.usageEvent.create({
      data: {
        userId: userId ?? null,
        event,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (e) {
    logger.warn("[UsageEvent] Failed to record", { event, error: String(e) });
  }
}
