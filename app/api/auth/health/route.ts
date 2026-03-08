import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Supabase connectivity check. Returns { ok, message }. No internal config exposed.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, message: "Service unavailable" },
      { status: 503 }
    );
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
      return NextResponse.json(
        { ok: false, message: "Service unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, message: "OK" }, { status: 200 });
  } catch (err) {
    logger.error("[Auth/Health] Supabase connection failed", { error: String(err) });
    return NextResponse.json(
      { ok: false, message: "Service unavailable" },
      { status: 503 }
    );
  }
}
