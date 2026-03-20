import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";
import { createSecureRoute } from "@/lib/secureRoute";

/**
 * Supabase connectivity check. Returns { ok, message }. No internal config exposed.
 */
export const GET = createSecureRoute<undefined>({
  auth: "optional",
  csrf: false,
  rateLimit: "sensitive",
  bodyMode: "none",
  logContext: "Auth/Health/GET",
  handler: async ({ request }) => {
    const safeEquals = (a: string, b: string): boolean => {
      const aBuf = Buffer.from(a);
      const bBuf = Buffer.from(b);
      if (aBuf.length !== bBuf.length) return false;
      return timingSafeEqual(aBuf, bBuf);
    };

    const secret = process.env.HEALTHCHECK_SECRET?.trim();
    if (secret) {
      const provided =
        request.headers.get("x-health-secret") ??
        request.headers.get("x-healthcheck-secret") ??
        "";
      if (!safeEquals(provided, secret)) {
        return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
      }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ ok: false, message: "Service unavailable" }, { status: 503 });
    }

    try {
      const settingsUrl = `${url.replace(/\/$/, "")}/auth/v1/settings`;
      const res = await fetch(settingsUrl, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        return NextResponse.json({ ok: false, message: "Service unavailable" }, { status: 503 });
      }
      return NextResponse.json({ ok: true, message: "OK" }, { status: 200 });
    } catch (err) {
      logger.error("[Auth/Health] Supabase connection failed", { error: String(err) });
      return NextResponse.json({ ok: false, message: "Service unavailable" }, { status: 503 });
    }
  },
});
