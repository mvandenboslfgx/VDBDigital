/**
 * SEO scoring: title, meta, H1, alt, links, word count, canonical.
 */

import type { CrawlSignals } from "../types";
import type { CategoryScoreResult, Issue } from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function calculateSeoScore(signals: CrawlSignals): CategoryScoreResult {
  const issues: Issue[] = [];
  const recommendations: string[] = [];
  let score = 0;

  if (!signals.title || signals.title.length < 10) {
    issues.push({ severity: "critical", message: "Titel-tag ontbreekt of is te kort" });
    recommendations.push("Voeg een unieke titel-tag toe van 10–60 tekens");
  } else {
    score += 15;
    if (signals.title.length > 60) {
      issues.push({ severity: "improvement", message: "Titel-tag is te lang voor zoekresultaten" });
      recommendations.push("Houd de titel-tag onder 60 tekens");
    }
  }

  if (!signals.metaDescription || signals.metaDescription.length < 50) {
    issues.push({ severity: "warning", message: "Meta description ontbreekt of is te kort" });
    recommendations.push("Schrijf een meta description van 50–160 tekens");
  } else if (signals.metaDescription.length >= 50 && signals.metaDescription.length <= 160) {
    score += 15;
  } else {
    score += 8;
    if (signals.metaDescription.length > 160) {
      issues.push({ severity: "improvement", message: "Meta description is te lang" });
      recommendations.push("Houd de meta description onder 160 tekens");
    }
  }

  if (signals.h1Count === 0) {
    issues.push({ severity: "critical", message: "Geen H1-kop gevonden" });
    recommendations.push("Voeg één duidelijke H1-kop toe per pagina");
  } else if (signals.h1Count === 1) {
    score += 15;
  } else {
    score += 5;
    issues.push({ severity: "warning", message: "Meerdere H1-koppen kunnen SEO schaden" });
    recommendations.push("Gebruik één H1 per pagina voor duidelijkheid");
  }

  const totalImg = signals.imageCount || 1;
  const withAlt = signals.imageCount - signals.imagesWithoutAlt;
  const altRatio = withAlt / totalImg;
  if (altRatio < 0.5) {
    issues.push({ severity: "warning", message: "Veel afbeeldingen zonder alt-tekst" });
    recommendations.push("Voeg alt-attributen toe aan alle afbeeldingen");
  }
  if (altRatio >= 0.9) score += 15;
  else if (altRatio >= 0.5) score += 8;

  if (signals.internalLinks < 3) {
    issues.push({ severity: "warning", message: "Weinig interne links" });
    recommendations.push("Voeg interne links toe naar relevante pagina's");
  }
  if (signals.internalLinks >= 3) score += 10;
  else if (signals.internalLinks >= 1) score += 5;

  if (signals.wordCount < 300) {
    issues.push({ severity: "improvement", message: "Weinig tekst op de pagina" });
    recommendations.push("Voeg meer kwalitatieve content toe (min. 300 woorden)");
  }
  if (signals.wordCount >= 300) score += 10;

  if (!signals.canonicalTag) {
    issues.push({ severity: "improvement", message: "Geen canonical tag" });
    recommendations.push("Overweeg een canonical tag voor duplicate content");
  } else {
    score += 10;
  }

  if (signals.structuredData) score += 10;
  else recommendations.push("Overweeg structured data (JSON-LD) voor rich snippets");

  if (signals.viewportMeta) score += 5;
  else {
    issues.push({ severity: "warning", message: "Geen viewport meta tag" });
    recommendations.push("Voeg een viewport meta tag toe voor mobiel");
  }

  return {
    score: clamp(score),
    issues,
    recommendations,
  };
}
