/**
 * Base URL for redirects, webhooks, emails. Never use localhost in production.
 * Prefer SITE_URL, then VERCEL_URL (set automatically on Vercel).
 */

export function getBaseUrl(): string {
  const site = process.env.SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  if (process.env.NODE_ENV === "production") {
    return "https://vdb.digital";
  }
  return "http://localhost:3000";
}
