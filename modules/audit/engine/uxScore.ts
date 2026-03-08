/**
 * UX scoring: heading hierarchy, readability, mobile signals, navigation.
 */

import type { CrawlSignals } from "../types";
import type { CategoryScoreResult, Issue } from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function calculateUxScore(signals: CrawlSignals): CategoryScoreResult {
  const issues: Issue[] = [];
  const recommendations: string[] = [];
  let score = 50;

  const headingCount = signals.headingCount ?? signals.h1Count + signals.h2Count;
  if (headingCount < 2) {
    issues.push({ severity: "warning", message: "Weinig of geen duidelijke koppenstructuur" });
    recommendations.push("Gebruik H2/H3 voor secties om de pagina scanbaar te maken");
  } else if (headingCount >= 5) {
    score += 15;
  } else if (signals.h2Count >= 2) {
    score += 10;
  }

  const totalLinks = signals.internalLinks + signals.externalLinks;
  if (totalLinks < 5) {
    issues.push({ severity: "warning", message: "Weinig links voor navigatie" });
    recommendations.push("Voeg duidelijke navigatielinks toe");
  } else if (totalLinks >= 5 && totalLinks <= 150) {
    score += 15;
  } else if (totalLinks > 150) {
    recommendations.push("Overweeg minder links per pagina voor duidelijkheid");
  }

  if (signals.wordCount < 300) {
    issues.push({ severity: "improvement", message: "Korte pagina kan weinig context bieden" });
    recommendations.push("Voeg voldoende tekst toe voor leesbaarheid en context");
  } else if (signals.wordCount >= 300 && signals.wordCount <= 5000) {
    score += 10;
  }

  const totalImg = signals.imageCount || 1;
  const withAlt = signals.imageCount - signals.imagesWithoutAlt;
  if (totalImg > 0 && withAlt / totalImg >= 0.8) score += 10;
  else if (totalImg > 0) {
    recommendations.push("Alt-teksten verbeteren toegankelijkheid en UX");
  }

  if (!signals.viewportMeta) {
    issues.push({ severity: "warning", message: "Geen viewport meta – mogelijk niet mobielvriendelijk" });
    recommendations.push("Voeg viewport meta toe voor responsive weergave");
  } else {
    score += 5;
  }

  if (signals.h1Count !== 1) {
    if (signals.h1Count === 0) issues.push({ severity: "critical", message: "Geen H1 – hiërarchie onduidelijk" });
    else issues.push({ severity: "improvement", message: "Meerdere H1’s – één duidelijke paginatitel verbetert navigatie" });
  }

  return {
    score: clamp(score),
    issues,
    recommendations,
  };
}
