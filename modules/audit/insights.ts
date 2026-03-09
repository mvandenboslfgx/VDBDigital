/**
 * AI insight generation only. AI reads signals and scores and produces
 * human explanations and recommendations. No score calculation.
 */

import { openai } from "@/lib/openai";
import type { CrawlSignals, AuditScores, TechnicalDataSummary } from "./types";

export interface ActiveAdContext {
  title: string;
  description: string;
  url: string;
  targetMetric?: string;
}

export async function generateAiInsights(
  signals: CrawlSignals,
  scores: AuditScores,
  technical: TechnicalDataSummary,
  fullReport: boolean,
  activeAd?: ActiveAdContext | null
): Promise<{ summary: string; summaryShort?: string }> {
  const input = {
    signals: {
      title: signals.title,
      metaDescriptionLength: signals.metaDescription.length,
      h1Count: signals.h1Count,
      h2Count: signals.h2Count,
      imageCount: signals.imageCount,
      imagesWithoutAlt: signals.imagesWithoutAlt,
      internalLinks: signals.internalLinks,
      externalLinks: signals.externalLinks,
      canonicalTag: signals.canonicalTag,
      viewportMeta: signals.viewportMeta,
      structuredData: signals.structuredData,
      formCount: signals.formCount,
      ctaCount: signals.ctaCount,
      wordCount: signals.wordCount,
    },
    scores,
    technical,
    ...(activeAd && {
      partnerTool: {
        title: activeAd.title,
        description: activeAd.description,
        url: activeAd.url,
        targetMetric: activeAd.targetMetric,
      },
    }),
  };

  const systemPrompt = activeAd
    ? "Je bent een conversie-expert. Schrijf alleen op basis van de gegeven data. Geen scores berekenen of verzinnen. Als er een partner-tool wordt meegegeven in de context, verweef deze dan subtiel in je advies als dé oplossing voor het specifieke probleem (bijv. SEO of Snelheid). Wees natuurlijk en niet commercieel opdringerig."
    : "Je bent een senior webstrateeg. Schrijf alleen op basis van de gegeven data. Geen scores berekenen of verzinnen.";

  const prompt = fullReport
    ? `Je bent een webstrateeg. Op basis van onderstaande TECHNISCHE DATA (geen schattingen) schrijf een kort auditrapport in het Nederlands. Gebruik EXACT deze koppen:

## Belangrijkste problemen
(2-4 bulletpoints: wat ontbreekt of kan beter op basis van de cijfers; noem bij elk of de prioriteit HOOG of MEDIUM is)

## Aanbevolen verbeteringen
(2-4 bulletpoints: concrete acties; begin met [HOOG] of [MEDIUM] voor prioriteit)

## Geschatte groeikans
(één korte alinea op basis van de scores)

Data (alleen ter referentie, niet overschrijven): ${JSON.stringify(input)}
Schrijf in het Nederlands. Wees bondig en actiegericht.`
    : `Vat in 2-3 zinnen samen: wat is het sterkste punt en één concrete verbetering op basis van deze data. Nederlands. Data: ${JSON.stringify(input)}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "Geen AI-samenvatting beschikbaar.";
    const summary = raw.slice(0, 8000);
    if (fullReport) return { summary };
    return { summary, summaryShort: summary.slice(0, 500) };
  } catch {
    return {
      summary: "AI-samenvatting kon niet worden gegenereerd. Bekijk de scores en technische data hieronder.",
      summaryShort: "Bekijk de technische data en scores.",
    };
  }
}
