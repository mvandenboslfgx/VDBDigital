/**
 * Conversion scoring: CTA presence/clarity, contact visibility, trust signals.
 */

import type { CrawlSignals } from "../types";
import type { CategoryScoreResult, Issue } from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function calculateConversionScore(signals: CrawlSignals): CategoryScoreResult {
  const issues: Issue[] = [];
  const recommendations: string[] = [];
  let score = 40;

  if (signals.ctaCount === 0) {
    issues.push({ severity: "critical", message: "Geen duidelijke call-to-action gevonden" });
    recommendations.push("Voeg een zichtbare CTA-knop of -link toe (bijv. Neem contact op, Bestel)");
  } else {
    score += 15;
    if (signals.ctaCount === 1) {
      issues.push({ severity: "improvement", message: "CTA duidelijkheid kan beter met meerdere opties" });
      recommendations.push("Overweeg meerdere CTAs voor verschillende acties (contact, offerte, nieuwsbrief)");
    }
  }

  if (signals.formCount === 0) {
    issues.push({ severity: "warning", message: "Geen formulier gevonden" });
    recommendations.push("Voeg een contact- of aanmeldformulier toe voor conversie");
  } else {
    score += 15;
  }

  if (!signals.title || signals.title.length === 0) {
    issues.push({ severity: "warning", message: "Geen paginatitel – waardepropositie onduidelijk" });
  } else {
    score += 10;
  }

  if (!signals.metaDescription || signals.metaDescription.length === 0) {
    recommendations.push("Meta description versterkt vertrouwen in zoekresultaten");
  } else {
    score += 10;
  }

  if (!signals.h1Text || signals.h1Text.length === 0) {
    recommendations.push("Een duidelijke H1 communiceert direct het aanbod");
  } else {
    score += 5;
  }

  if (signals.internalLinks < 3) {
    recommendations.push("Interne links naar diensten of contact verhogen conversiekansen");
  } else {
    score += 5;
  }

  return {
    score: clamp(score),
    issues,
    recommendations,
  };
}
