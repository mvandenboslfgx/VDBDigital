import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/apiSecurity";
import { validateOrigin } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  try {
    const key = `analytics-visit:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const body = (await request.json().catch(() => ({}))) as { path?: string } | undefined;
    const path = body?.path ? sanitizeString(String(body.path), 500) : null;

    await prisma.analyticsEvent.create({
      data: { type: "visit", path: path || undefined },
    });

    return NextResponse.json(
      { success: true, message: "Visit recorded." },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[Analytics/Visit] Error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Unable to record visit." },
      { status: 500 }
    );
  }
}
