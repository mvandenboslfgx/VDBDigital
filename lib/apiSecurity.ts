/**
 * API security: origin/referer validation, input sanitization, URL validation.
 * OWASP: CSRF, XSS, open redirect, injection.
 */

const BASE_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://vdb.digital",
  "https://www.vdb.digital",
  "https://vdbdigital.nl",
  "https://www.vdbdigital.nl",
]);

function isLocalhostOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin && !referer) return true;
  const check = origin ?? referer ?? "";
  if (!check) return true;
  try {
    const url = new URL(check);
    if (BASE_ORIGINS.has(url.origin)) return true;
    if (isLocalhostOrigin(url.origin)) return true;
    if (process.env.SITE_URL && url.origin === new URL(process.env.SITE_URL).origin) return true;
    if (process.env.VERCEL_URL && url.origin === `https://${process.env.VERCEL_URL}`) return true;
    return false;
  } catch {
    return false;
  }
}

/** Sanitize string: strip HTML/control chars, trim, length cap. Reduces XSS risk. */
export function sanitizeString(value: string, maxLen = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[<>]/g, "")
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function sanitizeEmail(email: string): string {
  return sanitizeString(email, 120).toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailFormat(email: string): boolean {
  return typeof email === "string" && EMAIL_REGEX.test(email) && email.length <= 254;
}

/** Sanitize and validate URL: http/https only. Prevents javascript:, data:, etc. */
export function sanitizeWebsiteUrl(raw: string, maxLen = 500): string | null {
  const s = sanitizeString(raw, maxLen);
  if (!s) return null;
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const out = url.origin + url.pathname + url.search;
    return out.length <= maxLen ? out : null;
  } catch {
    return null;
  }
}

/** Validate and clamp integer for pagination/limits. */
export function sanitizeInt(value: unknown, min: number, max: number, def: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/** Reject prompt injection patterns in AI input. */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions/i,
  /disregard\s+(previous|all)/i,
  /you\s+are\s+now\s+/i,
  /new\s+instructions?:/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<\|[a-z_]+\|>/i,
];

export function containsPromptInjection(text: string): boolean {
  const t = text.slice(0, 2000);
  return PROMPT_INJECTION_PATTERNS.some((p) => p.test(t));
}
