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
    const body = (await request.json().catch(() => ({}))) as { topic?: string };
    const topic = String(body.topic ?? "").trim().slice(0, 300);
    if (!topic) {
      return NextResponse.json(
        { error: "Onderwerp is verplicht." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Je bent een SEO- en content-specialist voor de Nederlandse markt. Genereer 5 aantrekkelijke, zoekvriendelijke artikeltitels voor de kennisbank. Antwoord uitsluitend in JSON:
{
  "titles": ["Titel 1", "Titel 2", "Titel 3", "Titel 4", "Titel 5"]
}
Titels moeten in het Nederlands zijn, vraagstellend of informatief, en passen bij zoekopdrachten zoals "hoe ...", "waarom ...", "tips voor ...".`,
        },
        { role: "user", content: `Onderwerp: ${topic}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { error: "Geen antwoord van de AI." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw) as { titles?: string[] };
    const titles = Array.isArray(parsed.titles) ? parsed.titles.slice(0, 10) : [];
    return NextResponse.json({ titles });
  } catch (err) {
    console.error("[content-generator/titles]", err);
    return NextResponse.json(
      { error: "Genereren mislukt. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
