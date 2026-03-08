import { NextResponse } from "next/server";
import { requireAdminOrOwner } from "@/lib/auth";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireAdminOrOwner();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      topic?: string;
    };
    const title = String(body.title ?? body.topic ?? "").trim().slice(0, 500);
    if (!title) {
      return NextResponse.json(
        { error: "Titel of onderwerp is verplicht." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Je bent een SEO- en content-specialist. Schrijf een volledig kennisbankartikel in het Nederlands in Markdown.

Regels:
- Gebruik ## voor hoofdkop (H2) en ### voor subkop (H3).
- Schrijf 4-8 secties met duidelijke koppen.
- Geef praktische voorbeelden waar passend.
- Taal: professioneel Nederlands, toegankelijk.
- Antwoord uitsluitend in JSON:
{
  "metaTitle": "max 60 tekens voor SEO",
  "metaDescription": "max 155 tekens voor SEO",
  "content": "volledige artikeltekst in Markdown (gebruik \\n voor newlines)"
}`,
        },
        { role: "user", content: `Schrijf een artikel met als titel: ${title}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { error: "Geen antwoord van de AI." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw) as {
      metaTitle?: string;
      metaDescription?: string;
      content?: string;
    };
    return NextResponse.json({
      seoTitle: parsed.metaTitle ?? title,
      seoDescription: parsed.metaDescription ?? "",
      content: parsed.content ?? "",
    });
  } catch (err) {
    console.error("[content-generator/article]", err);
    return NextResponse.json(
      { error: "Genereren mislukt. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
