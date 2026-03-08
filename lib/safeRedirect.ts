/**
 * Safe redirect: prevent open redirects. Only allow relative paths on same origin.
 */
const RELATIVE_PATH = /^\/(?!\/)[\w\-\/.]*$/;

export function getSafeRedirectUrl(next: string | null, fallback: string): string {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed) return fallback;
  if (!RELATIVE_PATH.test(trimmed)) return fallback;
  return trimmed;
}

export function getSafeRedirectFromRequest(request: Request, fallback: string): string {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  return getSafeRedirectUrl(next, fallback);
}
