import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { validateOrigin, sanitizeEmail } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { success: false, message: "Invalid request origin." },
        { status: 403 }
      );
    }

    const key = `newsletter:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Too many requests." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { email?: string; source?: string };
    const email = sanitizeEmail(body.email ?? "");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required." },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source: (body.source ?? "website").slice(0, 50) },
      update: {},
    });

    logger.info("[Newsletter] Subscribed", { email: email.slice(0, 3) + "***" });
    return NextResponse.json(
      { success: true, message: "Subscribed successfully." },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[Newsletter] Subscribe error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Could not subscribe." },
      { status: 500 }
    );
  }
}
