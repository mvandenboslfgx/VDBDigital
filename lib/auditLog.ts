/**
 * Audit logging for important events. Stored in database for compliance and debugging.
 */

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type AuditEventType =
  | "user_signup"
  | "plan_upgrade"
  | "ai_tool_used"
  | "calculator_used"
  | "admin_action";

export interface AuditLogInput {
  event: AuditEventType;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Write an audit log entry. Fire-and-forget; never throws to caller.
 */
export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        event: input.event,
        userId: input.userId ?? null,
        metadata: (input.metadata ?? {}) as object,
      },
    });
  } catch (e) {
    logger.logError("AuditLog/write", e, { event: input.event });
  }
}

/** Convenience: log user signup. */
export async function auditUserSignup(userId: string, email?: string): Promise<void> {
  await writeAuditLog({
    event: "user_signup",
    userId,
    metadata: email ? { email: email.slice(0, 3) + "***" } : undefined,
  });
}

/** Convenience: log plan upgrade (or change). */
export async function auditPlanUpgrade(
  userId: string,
  planName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await writeAuditLog({
    event: "plan_upgrade",
    userId,
    metadata: { planName, ...metadata },
  });
}

/** Convenience: log AI tool use. */
export async function auditAiToolUsed(
  userId: string | null,
  tool: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await writeAuditLog({
    event: "ai_tool_used",
    userId: userId ?? undefined,
    metadata: { tool, ...metadata },
  });
}

/** Convenience: log calculator use. */
export async function auditCalculatorUsed(
  userId: string | null,
  calculatorType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await writeAuditLog({
    event: "calculator_used",
    userId: userId ?? undefined,
    metadata: { calculatorType, ...metadata },
  });
}

/** Convenience: log admin action. */
export async function auditAdminAction(
  adminUserId: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await writeAuditLog({
    event: "admin_action",
    userId: adminUserId,
    metadata: { action, ...metadata },
  });
}
