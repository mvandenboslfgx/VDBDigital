export async function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logger } = await import("@/lib/logger");
  if (!process.env.REDIS_URL?.trim()) {
    logger.warn(
      "[Security] REDIS_URL is not set: rate limits use strict per-process memory fallback. Set REDIS_URL in production for distributed rate limiting."
    );
  }
}
