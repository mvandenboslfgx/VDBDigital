import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { validateOrigin, sanitizeString } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
    }
    const key = `ai:seo-kw:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json().catch(() => ({}))) as {
      website?: string;
      keyword?: string;
    };
    const website = sanitizeString(body.website ?? "", 500).trim();
    const keyword = sanitizeString(body.keyword ?? "", 200).trim();
    if (!website && !keyword) {
      return NextResponse.json(
        { message: "Vul een website-URL of een keyword in." },
        { status: 400 }
      );
    }

    const prompt = website
      ? `Op basis van de website "${website}": genereer 10 relevante zoekwoorden waarop deze site zou moeten ranken. Geef per keyword: het keyword, zoekintentie (informational / transactional / commercial), en een korte content-suggestie (onderwerp voor een artikel of pagina). Antwoord in het Nederlands in JSON: { "keywords": [ { "keyword": "...", "intent": "...", "contentSuggestion": "..." } ] }`
      : `Voor het keyword "${keyword}": genereer 10 gerelateerde zoekwoorden met zoekintentie en content-suggesties. Antwoord in het Nederlands in JSON: { "keywords": [ { "keyword": "...", "intent": "informational|transactional|commercial", "contentSuggestion": "..." } ] }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Je bent een SEO-specialist. Antwoord altijd in geldig JSON. Gebruik Nederlandse content-suggesties.",
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
    const parsed = JSON.parse(raw) as { keywords?: Array<{ keyword: string; intent: string; contentSuggestion: string }> };
    return NextResponse.json({
      success: true,
      keywords: parsed.keywords ?? [],
    });
  } catch (error) {
    return handleApiError(error, "AI/SeoKeywordFinder");
  }
}
