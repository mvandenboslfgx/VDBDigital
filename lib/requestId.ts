/**
 * Request ID helpers for consistent log correlation.
 */

export function getRequestIdFromRequest(request: Request): string | null {
  const h = request.headers.get("x-request-id");
  if (!h) return null;
  const trimmed = h.trim();
  return trimmed.length > 0 && trimmed.length <= 200 ? trimmed : null;
}

export function generateRequestId(): string {
  // Node 20 / modern runtimes have crypto.randomUUID; middleware might also.
  const c = globalThis.crypto as Crypto | undefined;
  if (c && "randomUUID" in c) {
    return (c as unknown as { randomUUID: () => string }).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

