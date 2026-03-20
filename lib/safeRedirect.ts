import { NextResponse } from "next/server";

/**
 * Safe redirect: prevent open redirects. Only allow relative paths on same origin.
 */
const RELATIVE_PATH = new RegExp("^/(?!/)[\\w\\-/.]*$");

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

/**
 * Safe redirect for external partners.
 * - Allows only `http:` / `https:` absolute URLs.
 * - Blocks control characters and credentials/userinfo.
 * - Returns JSON error response if invalid.
 */
export function safeRedirect(target: string): NextResponse {
  const trimmed = typeof target === "string" ? target.trim() : "";
  if (!trimmed) return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  if (/[\r\n]/.test(trimmed)) return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }
  if (url.username || url.password) {
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }

  // Additional hardening: reject host/userinfo confusion edge cases.
  if (url.host.includes("@")) {
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }

  const res = NextResponse.redirect(url.toString(), 302);
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

// Backwards-compatible alias.
export const safeRedirectExternal = safeRedirect;
