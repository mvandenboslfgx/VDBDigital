/**
 * Layer 3: Deterministic score calculation. Same signals → same scores.
 * No AI. All rules are explicit and reproducible.
 */

import type { CrawlSignals, PerformanceData, AuditScores, TechnicalDataSummary } from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * SEO score 0-100. Rules:
 * title present +15, meta description +10, single H1 +10, image alt coverage +15,
 * canonical +10, internal links +10, structured data +10, viewport +10.
 */
export function calculateSeoScore(signals: CrawlSignals): number {
  let score = 0;
  if (signals.title.length >= 10) score += 15;
  else if (signals.title.length > 0) score += 8;
  if (signals.metaDescription.length >= 50 && signals.metaDescription.length <= 160) score += 10;
  else if (signals.metaDescription.length > 0) score += 5;
  if (signals.h1Count === 1) score += 10;
  else if (signals.h1Count > 1) score += 3;
  const totalImg = signals.imageCount || 1;
  const withAlt = signals.imageCount - signals.imagesWithoutAlt;
  if (withAlt / totalImg >= 0.9) score += 15;
  else if (withAlt / totalImg >= 0.5) score += 8;
  if (signals.canonicalTag) score += 10;
  if (signals.internalLinks >= 3) score += 10;
  else if (signals.internalLinks >= 1) score += 5;
  if (signals.structuredData) score += 10;
  if (signals.viewportMeta) score += 10;
  if (signals.robotsMeta && !/noindex/i.test(signals.robotsMeta)) score += 5;
  return clamp(score);
}

/**
 * UX score 0-100. Heading structure, links, content length, images alt, viewport.
 */
export function calculateUXScore(signals: CrawlSignals): number {
  let score = 50;
  if (signals.headingCount != null && signals.headingCount >= 5) score += 15;
  else if (signals.h2Count >= 2) score += 10;
  const totalLinks = signals.internalLinks + signals.externalLinks;
  if (totalLinks >= 5 && totalLinks <= 150) score += 15;
  if (signals.wordCount >= 300 && signals.wordCount <= 5000) score += 10;
  const totalImg = signals.imageCount || 1;
  const withAlt = signals.imageCount - signals.imagesWithoutAlt;
  if (withAlt / totalImg >= 0.8) score += 10;
  if (signals.viewportMeta) score += 5;
  return clamp(score);
}

/**
 * Conversion score 0-100. CTAs, forms, title, meta, H1, internal links.
 */
export function calculateConversionScore(signals: CrawlSignals): number {
  let score = 40;
  if (signals.ctaCount >= 1) score += 15;
  if (signals.formCount >= 1) score += 15;
  if (signals.title.length > 0) score += 10;
  if (signals.metaDescription.length > 0) score += 10;
  if (signals.h1Text && signals.h1Text.length > 0) score += 5;
  if (signals.internalLinks >= 3) score += 5;
  return clamp(score);
}

/**
 * Performance score 0-100. Uses PageSpeed when available; otherwise heuristic from signals.
 */
export function calculatePerformanceScore(
  signals: CrawlSignals,
  performanceData: PerformanceData | null
): number {
  if (performanceData?.performanceScore != null) {
    return clamp(performanceData.performanceScore);
  }
  let score = 70;
  if (signals.imageCount > 30) score -= 15;
  else if (signals.imageCount > 15) score -= 8;
  const totalImg = signals.imageCount || 1;
  const withAlt = signals.imageCount - signals.imagesWithoutAlt;
  if (totalImg > 0 && withAlt / totalImg < 0.5) score -= 5;
  if (signals.wordCount > 10000) score -= 5;
  return clamp(score);
}

/**
 * Build technical summary for report transparency.
 */
export function buildTechnicalSummary(signals: CrawlSignals): TechnicalDataSummary {
  return {
    h1Count: signals.h1Count,
    h2Count: signals.h2Count,
    imagesMissingAlt: signals.imagesWithoutAlt,
    imageCount: signals.imageCount,
    internalLinks: signals.internalLinks,
    externalLinks: signals.externalLinks,
    canonicalPresent: signals.canonicalTag,
    metaDescriptionPresent: signals.metaDescription.length > 0,
    metaDescriptionLength: signals.metaDescription.length,
    viewportPresent: signals.viewportMeta,
    structuredDataPresent: signals.structuredData,
    formCount: signals.formCount,
    ctaCount: signals.ctaCount,
    wordCount: signals.wordCount,
  };
}

/**
 * Compute all four scores deterministically.
 */
export function calculateAllScores(
  signals: CrawlSignals,
  performanceData: PerformanceData | null
): AuditScores {
  return {
    seoScore: calculateSeoScore(signals),
    uxScore: calculateUXScore(signals),
    conversionScore: calculateConversionScore(signals),
    performanceScore: calculatePerformanceScore(signals, performanceData),
  };
}
