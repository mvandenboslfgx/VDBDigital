import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { validateOrigin, sanitizeString } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";

export const runtime = "nodejs";

const MAX_INPUT = 8000;

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
    }
    const key = `ai:copy-opt:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json().catch(() => ({}))) as { text?: string };
    const text = sanitizeString(body.text ?? "", MAX_INPUT).trim();
    if (!text) {
      return NextResponse.json(
        { message: "Plak de te optimaliseren tekst." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Je bent een copywriter. Optimaliseer de gegeven tekst: sterkere headlines, betere CTAs, leesbaarheid. Antwoord in het Nederlands in JSON: { \"improvedCopy\": \"volledige verbeterde tekst\", \"headlines\": [\"optie1\", \"optie2\"], \"ctas\": [\"cta1\", \"cta2\"], \"readabilityTips\": \"korte tips\" }",
        },
        {
          role: "user",
          content: `Optimaliseer deze copy:\n\n${text.slice(0, 6000)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { message: "Geen antwoord van de AI." },
        { status: 500 }
      );
    }
    const result = JSON.parse(raw) as {
      improvedCopy?: string;
      headlines?: string[];
      ctas?: string[];
      readabilityTips?: string;
    };
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleApiError(error, "AI/CopyOptimizer");
  }
}
