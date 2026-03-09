import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendContactAdminNotification,
  sendContactUserConfirmation,
} from "@/lib/mailer";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { validateOrigin, sanitizeString, sanitizeEmail } from "@/lib/apiSecurity";
import { isBodyOverLimit, MAX_BODY_BYTES_DEFAULT } from "@/lib/requestSafety";
import { contactBodySchema, safeParse } from "@/lib/validation";
import { validateCsrf } from "@/lib/csrf";
import { verifyTurnstileToken, isTurnstileEnabled } from "@/lib/turnstile";
import { logger } from "@/lib/logger";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";

export async function POST(request: Request) {
  try {
    if (!validateCsrf(request)) {
      return safeJsonError("Ongeldige aanvraag.", 403);
    }
    if (!validateOrigin(request)) {
      return safeJsonError("Ongeldige aanvraag.", 403);
    }

    const key = `contact:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    if (isBodyOverLimit(request, MAX_BODY_BYTES_DEFAULT, true)) {
      return safeJsonError("Verzoek te groot.", 413);
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      company?: string;
      message?: string;
      botField?: string;
      website?: string;
      turnstileToken?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
    };

    if (isTurnstileEnabled() && body.turnstileToken) {
      const ip = getClientKey(request);
      const valid = await verifyTurnstileToken(body.turnstileToken, ip);
      if (!valid) {
        return safeJsonError("Verificatie mislukt. Vernieuw de pagina en probeer opnieuw.", 400);
      }
    }

    if (body.botField && String(body.botField).trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Bedankt. Je bericht is ontvangen." },
        { status: 200 }
      );
    }
    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Bedankt. Je bericht is ontvangen." },
        { status: 200 }
      );
    }

    const parsed = safeParse(contactBodySchema, body);
    if (!parsed.success) {
      const issues = parsed.error.issues ?? (parsed.error as { errors?: { message: string }[] }).errors ?? [];
      const msg = issues.map((e: { message: string }) => e.message).join(" ") || "Ongeldige invoer.";
      return safeJsonError(msg, 400);
    }
    const name = sanitizeString(parsed.data.name, 80);
    const email = sanitizeEmail(parsed.data.email);
    const company = sanitizeString(parsed.data.company, 120);
    const message = sanitizeString(parsed.data.message, 3000);

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        company: company || null,
        message,
        website: null,
        source: "contact",
        utmSource: sanitizeString(parsed.data.utmSource ?? "", 100) || null,
        utmMedium: sanitizeString(parsed.data.utmMedium ?? "", 100) || null,
        utmCampaign: sanitizeString(parsed.data.utmCampaign ?? "", 100) || null,
      },
    });

    logger.info("[Contact] Lead created", { id: lead.id, source: "contact" });

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
  } catch (error) {
    return handleApiError(error, "Contact");
  }
}
