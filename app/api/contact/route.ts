import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendContactAdminNotification,
  sendContactUserConfirmation,
} from "@/lib/mailer";
import { sanitizeString, sanitizeEmail } from "@/lib/apiSecurity";
import { MAX_BODY_BYTES_DEFAULT } from "@/lib/requestSafety";
import { contactBodySchema } from "@/lib/validation";
import { verifyTurnstileToken, isTurnstileEnabled } from "@/lib/turnstile";
import { logger } from "@/lib/logger";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { createSecureRoute } from "@/lib/secureRoute";

export const POST = createSecureRoute<{
  name: string;
  email: string;
  company?: string;
  message: string;
  botField?: string;
  website?: string;
  turnstileToken?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}>({
  auth: "optional",
  csrf: true,
  rateLimit: "sensitive",
  schema: contactBodySchema,
  maxBodyBytes: MAX_BODY_BYTES_DEFAULT,
  logContext: "Contact",
  invalidInputMessage: "Ongeldige invoer.",
  handler: async ({ input, requestId, request }) => {
    if (isTurnstileEnabled() && input.turnstileToken) {
      // Verify turnstile only when token is present.
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip")?.trim() ||
        "anonymous";
      const valid = await verifyTurnstileToken(input.turnstileToken, ip);
      if (!valid) {
        return safeJsonError(
          "Verificatie mislukt. Vernieuw de pagina en probeer opnieuw.",
          400,
          { requestId }
        );
      }
    }

    // Honeypot anti-bot
    if (input.botField && input.botField.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Bedankt. Je bericht is ontvangen." },
        { status: 200 }
      );
    }
    if (input.website && input.website.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Bedankt. Je bericht is ontvangen." },
        { status: 200 }
      );
    }

    const name = sanitizeString(input.name, 80);
    const email = sanitizeEmail(input.email);
    const company = sanitizeString(input.company ?? "", 120);
    const message = sanitizeString(input.message, 3000);

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        company: company || null,
        message,
        website: null,
        source: "contact",
        utmSource: sanitizeString(input.utmSource ?? "", 100) || null,
        utmMedium: sanitizeString(input.utmMedium ?? "", 100) || null,
        utmCampaign: sanitizeString(input.utmCampaign ?? "", 100) || null,
      },
    });

    logger.info("[Contact] Lead created", {
      leadId: lead.id.slice(0, 8),
      source: "contact",
      requestId,
    });

    void prisma.analyticsEvent.create({ data: { type: "lead" } }).catch(() => {});

    void (async () => {
      try {
        await Promise.all([
          sendContactUserConfirmation({ name, email }),
          sendContactAdminNotification({ name, email, company, message }),
        ]);
      } catch (error) {
        logger.error("[Contact] Email sending failed", { error: String(error) });
      }
    })();

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you. Your project details have been received and we'll be in touch shortly.",
      },
      { status: 200 }
    );
  },
});
