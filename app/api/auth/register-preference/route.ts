import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitRegistration, getClientKey } from "@/lib/rateLimit";
import { validateOrigin, sanitizeEmail, validateEmailFormat } from "@/lib/apiSecurity";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";
import { logger } from "@/lib/logger";

function isLocalhostRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const check = origin ?? referer ?? "";
  if (!check) return false;
  try {
    const url = new URL(check);
    const host = url.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      logger.warn("[Auth/RegisterPreference] Rejected: invalid origin");
      return NextResponse.json(
        { success: false, message: "Invalid request origin." },
        { status: 403 }
      );
    }

    const key = `registration:${getClientKey(request)}`;
    const skipRateLimit = isLocalhostRequest(request);
    if (!skipRateLimit) {
      const { ok } = rateLimitRegistration(key);
      if (!ok) {
        logger.warn("[Auth/RegisterPreference] Rate limit exceeded", { key });
        return NextResponse.json(
          { success: false, message: "Too many requests. Try again in a minute." },
          { status: 429 }
        );
      }
    }

    let body: { email?: string; newsletterOptIn?: boolean; website?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body." },
        { status: 400 }
      );
    }
    const email = sanitizeEmail(body.email ?? "");
    const newsletterOptIn = body.newsletterOptIn === true;

    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email required." },
        { status: 400 }
      );
    }

    await prisma.registrationNewsletter.upsert({
      where: { email },
      create: { email, newsletterOptIn },
      update: { newsletterOptIn },
    });

    logger.info("[Auth/RegisterPreference] Saved preference", { email: email.slice(0, 3) + "***" });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return handleApiError(e, "Auth/RegisterPreference");
  }
}
