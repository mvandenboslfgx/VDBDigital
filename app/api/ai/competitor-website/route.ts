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
    const key = `ai:competitor-w:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const rawUrl = (body.url ?? "").trim();
    const url = sanitizeWebsiteUrl(rawUrl, 500);
    if (!url) {
      return NextResponse.json(
        { message: "Vul een geldige website-URL van de concurrent in." },
        { status: 400 }
      );
    }

    const signals = await fetchAndParseSignals(url);
    const prompt = `Analyseer deze concurrent-website en geef inzichten. Data: URL=${signals.url}, title=${signals.title}, meta desc length=${signals.metaDescription?.length ?? 0}, H1 count=${signals.h1Count}, headings=${signals.headingCount}, forms=${signals.formCount ?? 0}, CTA-achtige links≈${signals.ctaLikeCount ?? 0}, images with alt=${signals.imageWithAltCount ?? 0}/${signals.imgCount}.

Antwoord in het Nederlands in JSON:
{
  "seo": "korte SEO-beoordeling + sterke/zwakke punten",
  "content": "contentkwaliteit en relevantie",
  "ux": "UX en structuur",
  "conversion": "conversie-elementen",
  "advantages": ["voordeel 1 t.o.v. gemiddelde site", "voordeel 2"],
  "improvements": ["verbetering 1", "verbetering 2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Je bent een competitieve analist. Antwoord in geldig JSON, Nederlands.",
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
      seo?: string;
      content?: string;
      ux?: string;
      conversion?: string;
      advantages?: string[];
      improvements?: string[];
    };
    return NextResponse.json({
      success: true,
      url: signals.url,
      ...analysis,
    });
  } catch (error) {
    return handleApiError(error, "AI/CompetitorWebsite");
  }
}
