import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPreviewRequestAdminNotification } from "@/lib/mailer";
import { logger } from "@/lib/logger";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/apiSecurity";

export async function POST(request: Request) {
  try {
    const key = `preview:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Too many preview requests. Please pause." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      businessName?: string;
      industry?: string;
      colorPreference?: string;
      style?: string;
      botField?: string;
    };

    if (body.botField && body.botField.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Thank you. Your preview request has been received for review.",
        },
        { status: 200 }
      );
    }

    const businessName = sanitizeString(body.businessName ?? "", 120);
    const industry = sanitizeString(body.industry ?? "", 120);
    const colorPreference = sanitizeString(body.colorPreference ?? "", 120);
    const style = sanitizeString(body.style ?? "Luxury", 40);

    if (!businessName || !industry) {
      return NextResponse.json(
        {
          success: false,
          message: "Business name and industry are required.",
        },
        { status: 400 }
      );
    }

    if (
      businessName.length > 120 ||
      industry.length > 120 ||
      colorPreference.length > 120 ||
      style.length > 40
    ) {
      return NextResponse.json(
        { success: false, message: "One or more fields are too long." },
        { status: 400 }
      );
    }

    const composedMessage = [
      `Preview request`,
      `Business name: ${businessName}`,
      `Industry: ${industry}`,
      `Color preference: ${colorPreference || "Not specified"}`,
      `Style: ${style}`,
    ].join(" | ");

    await prisma.lead.create({
      data: {
        name: businessName,
        email: "preview@vdb.digital",
        company: industry,
        message: composedMessage,
        website: null,
        source: "builder",
      },
    });

    void (async () => {
      try {
        await sendPreviewRequestAdminNotification({
          businessName,
          industry,
          colorPreference: colorPreference || "Not specified",
          style,
        });
      } catch (error) {
        logger.error("[Preview] Email sending failed", { error: String(error) });
      }
    })();

    return NextResponse.json(
      {
        success: true,
        message:
          "Request received. We’ll review and craft a tailored preview concept for you.",
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[Preview] Unexpected error", { error: String(error) });
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while submitting your request.",
      },
      { status: 500 }
    );
  }
}

