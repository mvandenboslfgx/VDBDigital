/**
 * API request safety: body size limits to prevent DoS and abuse.
 * Use before parsing JSON in sensitive routes.
 */

export const MAX_BODY_BYTES_DEFAULT = 512 * 1024; // 512 KB
export const MAX_BODY_BYTES_STRIPE_WEBHOOK = 1024 * 1024; // 1 MB (Stripe events)

/**
 * Return Content-Length from request or null. Use to reject oversized bodies before reading.
 */
export function getContentLength(request: Request): number | null {
  const cl = request.headers.get("content-length");
  if (cl == null || cl === "") return null;
  const n = parseInt(cl, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * If Content-Length exceeds maxBytes, return true (caller should return 413).
 * When Content-Length is missing, allow (streaming); optionally set allowMissing to false to reject.
 */
export function isBodyOverLimit(request: Request, maxBytes: number, allowMissing = true): boolean {
  const len = getContentLength(request);
  if (len === null) return !allowMissing;
  return len > maxBytes;
}
