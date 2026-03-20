#!/usr/bin/env node
/**
 * Optional: validate required env vars at build/start.
 * Run: node scripts/validate-env.js
 * Exits 0 if all required are set (or NODE_ENV !== production), 1 otherwise.
 */
const required = [
  "DATABASE_URL",
  // DIRECT_URL is strongly recommended for migrations; optional for app runtime.
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
  "JWT_SECRET",
  "SITE_URL",
];
const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  console.log("[validate-env] Skipping (NODE_ENV !== production)");
  process.exit(0);
}
const missing = required.filter((k) => !process.env[k]?.trim());
if (!process.env.REDIS_URL?.trim()) {
  missing.push("REDIS_URL");
}
if (missing.length) {
  console.error("[validate-env] Missing required env in production:", missing.join(", "));
  process.exit(1);
}
console.log("[validate-env] OK");
process.exit(0);
