import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";
import { validateOrigin } from "@/lib/apiSecurity";

/**
 * Client-side analytics: POST { event: string, data?: object } to track events (e.g. upgrade_clicked).
 * Protected by origin check; no auth required for anonymous events.
 */
export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const event = typeof body?.event === "string" ? body.event.trim() : "";
    if (!event || event.length > 64) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const data = typeof body?.data === "object" && body.data !== null ? body.data : undefined;
    trackEvent(event, data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
