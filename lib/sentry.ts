/**
 * Error monitoring. To enable Sentry:
 * 1. npm install @sentry/nextjs
 * 2. npx @sentry/wizard@latest -i nextjs
 * 3. Set SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN in .env
 * When SENTRY_DSN is set, captureException/captureMessage are no-ops unless
 * you uncomment the Sentry calls below and export captureException from the
 * Sentry SDK (see @sentry/nextjs server API).
 */

const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production" || !SENTRY_DSN) return;
  // Optional: import * as Sentry from "@sentry/nextjs";
  // Sentry.captureException(error, { extra: context });
  void error;
  void context;
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  if (process.env.NODE_ENV !== "production" || !SENTRY_DSN) return;
  // Optional: Sentry.captureMessage(message, level);
  void message;
  void level;
}
