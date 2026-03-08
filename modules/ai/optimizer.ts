/**
 * AI Website Optimizer: generate improved title, meta description, CTA text, and SEO suggestions.
 */

import { openai } from "@/lib/openai";

export interface OptimizerInput {
  url?: string;
  currentTitle?: string;
  currentMetaDescription?: string;
  currentH1?: string;
  ctaCount?: number;
  industry?: string;
}

export interface OptimizerResult {
  improvedTitle: string;
  improvedMetaDescription: string;
  suggestedCtaText: string[];
  seoSuggestions: string[];
}

export async function generateOptimizations(input: OptimizerInput): Promise<OptimizerResult> {
  const prompt = `Je bent een SEO- en conversie-expert. Op basis van de volgende gegevens van een webpagina, geef concrete verbeteringen in het Nederlands. Antwoord ALLEEN met een geldig JSON-object met exact deze keys (strings of string-arrays):
- improvedTitle: een verbeterde paginatitel (max 60 tekens, SEO-vriendelijk)
- improvedMetaDescription: een verbeterde meta description (max 160 tekens)
- suggestedCtaText: array van 2-3 voorbeelden van korte CTA-teksten (bijv. "Neem contact op", "Vraag offerte aan")
- seoSuggestions: array van 3-5 korte SEO-aanbevelingen (bulletpoints)

Gegevens:
${JSON.stringify(input)}

Antwoord uitsluitend met het JSON-object, geen markdown.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
  const parsed = JSON.parse(raw.replace(/^```json\s?|\s?```$/g, "")) as Record<string, unknown>;

  return {
    improvedTitle: typeof parsed.improvedTitle === "string" ? parsed.improvedTitle.slice(0, 70) : "",
    improvedMetaDescription:
      typeof parsed.improvedMetaDescription === "string" ? parsed.improvedMetaDescription.slice(0, 170) : "",
    suggestedCtaText: Array.isArray(parsed.suggestedCtaText)
      ? parsed.suggestedCtaText.filter((x): x is string => typeof x === "string").slice(0, 5)
      : [],
    seoSuggestions: Array.isArray(parsed.seoSuggestions)
      ? parsed.seoSuggestions.filter((x): x is string => typeof x === "string").slice(0, 8)
      : [],
  };
}
