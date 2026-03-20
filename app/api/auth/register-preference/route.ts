import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSecureRoute } from "@/lib/secureRoute";
import { sanitizeEmail } from "@/lib/apiSecurity";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { logger } from "@/lib/logger";
import { registrationPreferenceBodySchema } from "@/lib/validation";

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

export const POST = createSecureRoute<{
  email: string;
  newsletterOptIn: boolean;
  website?: string;
}>({
  auth: "optional",
  csrf: true,
  rateLimit: "registration",
  logContext: "Auth/RegisterPreference",
  schema: registrationPreferenceBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  skipRateLimit: (request) => isLocalhostRequest(request),
  handler: async ({ input, requestId }) => {
    const email = sanitizeEmail(input.email);
    const newsletterOptIn = input.newsletterOptIn === true;

    if (input.website && input.website.trim().length > 0) {
      // Honeypot anti-bot
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!email) {
      return safeJsonError("Valid email required.", 400, { requestId });
    }

    await prisma.registrationNewsletter.upsert({
      where: { email },
      create: { email, newsletterOptIn },
      update: { newsletterOptIn },
    });

    logger.info("[Auth/RegisterPreference] Saved preference", {
      email: email.slice(0, 3) + "***",
      requestId,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  },
});
