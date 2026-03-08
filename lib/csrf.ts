/**
 * CSRF protection: validate Origin and Referer for mutating requests.
 * Use with validateOrigin() from apiSecurity; this adds strict Referer when present.
 */
import { validateOrigin } from "@/lib/apiSecurity";

export function validateCsrf(request: Request): boolean {
  if (!validateOrigin(request)) return false;
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refUrl = new URL(referer);
      const origin = request.headers.get("origin");
      const originUrl = origin ? new URL(origin) : null;
      if (originUrl && refUrl.origin !== originUrl.origin) return false;
    } catch {
      return false;
    }
  }
  return true;
}
