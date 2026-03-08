/**
 * Centralized logging. Structured for Sentry/Datadog. Never log secrets or PII in production.
 */

type LogLevel = "info" | "warn" | "error";

const isProduction = process.env.NODE_ENV === "production";

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (k.toLowerCase().includes("password") || k.toLowerCase().includes("secret") || k === "token") continue;
    out[k] = typeof v === "string" && v.length > 200 ? v.slice(0, 200) + "…" : v;
  }
  return out;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const safe = isProduction ? sanitizeMeta(meta) : meta;
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(safe && Object.keys(safe).length > 0 && { meta: safe }),
  };
  const line = `[${payload.timestamp}] [${level.toUpperCase()}] ${message}${safe ? ` ${JSON.stringify(safe)}` : ""}`;
  switch (level) {
    case "info":
      console.log(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
}

/**
 * Log an error with context. Use in catch blocks and API routes.
 * Ensures errors and warnings are consistently logged with context.
 */
export function logError(context: string, error: unknown, meta?: Record<string, unknown>): void {
  const msg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const combined = { ...meta, error: msg, ...(stack && !isProduction && { stack: stack.slice(0, 500) }) };
  log("error", `[${context}] ${msg}`, combined);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  /** No-op in production. */
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (!isProduction) log("info", `[DEBUG] ${message}`, meta);
  },
  /** Security events: rate limit, auth, admin, payment. Always logged. */
  security: (event: string, meta?: Record<string, unknown>) => {
    log("warn", `[Security] ${event}`, sanitizeMeta(meta));
  },
  /** Error with context (e.g. API route name). Use in catch blocks. */
  logError,
};
