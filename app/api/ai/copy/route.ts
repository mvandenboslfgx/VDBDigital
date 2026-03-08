import { NextResponse } from "next/server";
import { generateMarketingCopy } from "@/modules/ai-copy/logic";
import type { CopyInput } from "@/modules/ai-copy/types";
import { validateOrigin, sanitizeString } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      logger.warn("[AI/Copy] Rejected: invalid origin");
      return NextResponse.json(
        { message: "Invalid request origin." },
        { status: 403 }
      );
    }
    const key = `ai:copy:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json()) as Partial<CopyInput> & { location?: string };

    const companyName = sanitizeString(body.companyName ?? "", 120);
    const industry = sanitizeString(body.industry ?? "", 120);
    const city = sanitizeString((body.city ?? body.location ?? "").trim(), 80);
    const toneOfVoice = sanitizeString(body.toneOfVoice ?? "", 80);

    if (!companyName || !industry) {
      return NextResponse.json(
        { message: "Bedrijfsnaam en sector zijn verplicht." },
        { status: 400 }
      );
    }

    const input: CopyInput = {
      companyName,
      industry,
      city,
      toneOfVoice: toneOfVoice || "Kalm, scherp, premium",
    };

    const result = await generateMarketingCopy(input);

    const inputSummary = `${companyName} · ${industry}${
      city ? ` · ${city}` : ""
    } · Toon: ${input.toneOfVoice}`;

    return NextResponse.json(
      {
        inputSummary,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "AI/Copy");
  }
}

