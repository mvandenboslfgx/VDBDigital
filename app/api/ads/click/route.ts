import { NextResponse } from "next/server";
import { registerAdClick } from "@/lib/ads";
import { z } from "zod";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { handleApiError } from "@/lib/apiSafeResponse";

const clickSchema = z.object({ adId: z.string().min(1).max(64) });

/**
 * GET /api/ads/click?adId=xxx — register click and redirect to partner URL.
 */
export async function GET(request: Request) {
  try {
    const key = `ads:click:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = clickSchema.safeParse({ adId: searchParams.get("adId") ?? "" });
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing or invalid adId" }, { status: 400 });
    }
    const url = await registerAdClick(parsed.data.adId);
    if (!url) {
      return NextResponse.json({ error: "Ad not found or budget exceeded" }, { status: 404 });
    }
    return NextResponse.redirect(url);
  } catch (e) {
    return handleApiError(e, "ads/click");
  }
}
