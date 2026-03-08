import { NextResponse } from "next/server";
import { fetchAndParseSignals } from "@/lib/ai-website-audit";
import { openai } from "@/lib/openai";
import { validateOrigin, sanitizeWebsiteUrl } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
    }
    const key = `ai:conv:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const rawUrl = (body.url ?? "").trim();
    const url = sanitizeWebsiteUrl(rawUrl, 500);
    if (!url) {
      return NextResponse.json(
        { message: "Vul een geldige website-URL in." },
        { status: 400 }
      );
    }

    const signals = await fetchAndParseSignals(url);
    const prompt = `Analyseer deze websitedata voor conversie-optimalisatie. Geef korte, actiegerichte adviezen in het Nederlands.
Data: URL=${signals.url}, title=${signals.title}, meta description length=${signals.metaDescription?.length ?? 0}, H1 count=${signals.h1Count}, forms=${signals.formCount ?? 0}, CTA-achtige links≈${signals.ctaLikeCount ?? 0}, images with alt=${signals.imageWithAltCount ?? 0}/${signals.imgCount}.

Antwoord in JSON: {
  "ctaClarity": "korte beoordeling + tip",
  "trustSignals": "wat ontbreekt of kan beter",
  "pageStructure": "verbetering paginastructuur",
  "formOptimization": "tip voor formulieren",
  "improvements": ["tip1", "tip2", "tip3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Je bent een CRO-specialist. Antwoord in geldig JSON, Nederlands.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { message: "Geen antwoord van de AI." },
        { status: 500 }
      );
    }
    const analysis = JSON.parse(raw) as {
      ctaClarity?: string;
      trustSignals?: string;
      pageStructure?: string;
      formOptimization?: string;
      improvements?: string[];
    };
    return NextResponse.json({
      success: true,
      url: signals.url,
      analysis,
    });
  } catch (error) {
    return handleApiError(error, "AI/ConversionAnalyzer");
  }
}
