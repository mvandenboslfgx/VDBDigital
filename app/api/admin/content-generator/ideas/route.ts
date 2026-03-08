import { NextResponse } from "next/server";
import { requireAdminOrOwner } from "@/lib/auth";

export const runtime = "nodejs";

const SEED_IDEAS = [
  "SEO tips voor kleine ondernemers",
  "Website snelheid verbeteren",
  "Conversie optimalisatie",
  "AI marketing",
  "Digitale strategie",
  "Hoe verbeter je de SEO van je website?",
  "Waarom laadt je website langzaam?",
  "10 tips om je website conversie te verhogen",
  "Core Web Vitals uitleg",
  "Zoekwoorden onderzoek doen",
  "Meta description schrijven",
  "Technische SEO checklist",
  "Content marketing met AI",
  "Landingpage optimalisatie",
];

const POPULAR_TOOLS = [
  "Website analyse",
  "SEO Keyword Finder",
  "Conversie Analyzer",
  "Performance Check",
  "Content Generator",
];

export async function GET() {
  const user = await requireAdminOrOwner();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({
    ideas: SEED_IDEAS,
    tools: POPULAR_TOOLS,
  });
}
