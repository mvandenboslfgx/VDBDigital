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
    const key = `ai:content:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json().catch(() => ({}))) as { topic?: string };
    const topic = sanitizeString(body.topic ?? "", 300).trim();
    if (!topic) {
      return NextResponse.json(
        { message: "Vul een onderwerp in." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Je bent een content- en SEO-specialist. Genereer een SEO-blogartikel voor het gegeven onderwerp. Antwoord in het Nederlands in JSON:
{
  "metaTitle": "max 60 tekens",
  "metaDescription": "max 155 tekens",
  "headings": ["H2 of H3 koppen voor het artikel"],
  "article": "volledige blogtekst in markdown (kort, 3-5 alinea's)"
}`,
        },
        { role: "user", content: `Onderwerp: ${topic}` },
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
      metaTitle?: string;
      metaDescription?: string;
      headings?: string[];
      article?: string;
    };
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleApiError(error, "AI/ContentGenerator");
  }
}
