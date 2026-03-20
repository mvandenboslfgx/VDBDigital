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

/**
 * Returns a safe origin for redirect URLs.
 * Accept the request Origin only when protocol+host match our configured base URL.
 */
export function getTrustedOrigin(originHeader: string | null): string {
  const baseUrl = getBaseUrl();
  if (!originHeader) return baseUrl;

  try {
    const origin = new URL(originHeader);
    const base = new URL(baseUrl);
    if (origin.protocol !== base.protocol) return baseUrl;
    if (origin.host !== base.host) return baseUrl;
    return origin.origin;
  } catch {
    return baseUrl;
  }
}
