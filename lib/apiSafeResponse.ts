/**
 * Safe API responses: never expose stack traces or internal details to clients.
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const GENERIC_ERROR = "Er is iets misgegaan. Probeer het later opnieuw.";

export function safeJsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function safeJsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  const body: Record<string, unknown> = { success: false, message };
  if (extra && Object.keys(extra).length > 0) {
    Object.assign(body, extra);
  }
  return NextResponse.json(body, { status });
}

export function safeJson500(logMessage?: string) {
  return safeJsonError(GENERIC_ERROR, 500);
}

/**
 * Use in catch blocks: log internally, return generic message to client.
 * Never pass error.message or stack to the client in production.
 */
export function handleApiError(error: unknown, logContext: string): NextResponse {
  logger.logError(`API/${logContext}`, error);
  import("@/lib/sentry").then((m) => m.captureException(error, { context: logContext })).catch(() => {});
  if (process.env.NODE_ENV === "production") {
    return safeJsonError(GENERIC_ERROR, 500);
  }
  const msg = error instanceof Error ? error.message : String(error);
  return NextResponse.json(
    { success: false, message: GENERIC_ERROR, debug: msg },
    { status: 500 }
  );
}
