import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPreviewRequestAdminNotification } from "@/lib/mailer";
import { logger } from "@/lib/logger";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimitStore = new Map<
  string,
  { count: number; firstRequestTimestamp: number }
>();

const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

const getClientIdentifier = (request: Request) => {
  const forwarded =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";
  return forwarded.split(",")[0].trim() || "anonymous";
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstRequestTimestamp: now });
    return false;
  }
  if (now - entry.firstRequestTimestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, firstRequestTimestamp: now });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  return false;
};

export async function POST(request: Request) {
  try {
    const clientId = getClientIdentifier(request);
    if (isRateLimited(`preview:${clientId}`)) {
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

    const businessName = sanitize(body.businessName ?? "");
    const industry = sanitize(body.industry ?? "");
    const colorPreference = sanitize(body.colorPreference ?? "");
    const style = sanitize(body.style ?? "Luxury");

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

