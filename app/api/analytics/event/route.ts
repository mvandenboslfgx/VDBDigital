import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { validateOrigin } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";
import { recordUsageEvent } from "@/lib/usage-events";

const ALLOWED_TYPES = new Set([
  "registration",
  "signup",
  "lead",
  "newsletter",
  "audit_started",
  "audit_completed",
  "lead_created",
  "upgrade_clicked",
]);

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ success: false, message: "Invalid origin." }, { status: 403 });
    }
    const key = `analytics-event:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const body = (await request.json().catch(() => ({}))) as { type?: string } | undefined;
    const type = body?.type && ALLOWED_TYPES.has(body.type) ? body.type : null;
    if (!type) {
      return NextResponse.json(
        { success: false, message: "Invalid event type." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    await prisma.analyticsEvent.create({
      data: { type, userId: user?.id },
    });
    if (["signup", "audit_started", "audit_completed", "upgrade_clicked"].includes(type)) {
      await recordUsageEvent(type, user?.id);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const { handleApiError } = await import("@/lib/apiSafeResponse");
    return handleApiError(error, "Analytics/Event");
  }
}
