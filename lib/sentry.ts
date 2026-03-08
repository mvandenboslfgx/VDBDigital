/**
 * Optional error monitoring. Om Sentry in te schakelen:
 * 1. npm install @sentry/nextjs
 * 2. npx @sentry/wizard@latest -i nextjs
 * 3. SENTRY_DSN en NEXT_PUBLIC_SENTRY_DSN in .env zetten
 * Daarna kun je in deze file de echte Sentry-aanroep gebruiken.
 */

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") return;
  // Stub: wanneer @sentry/nextjs geïnstalleerd is, hier Sentry.captureException(error, { extra: context }) aanroepen
  void error;
  void context;
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  if (process.env.NODE_ENV !== "production") return;
  void message;
  void level;
}
