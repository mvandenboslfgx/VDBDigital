/**
 * Combined scoring with weights: SEO 30%, Performance 25%, UX 25%, Conversion 20%.
 * Returns totalScore, confidence, category scores, and merged issues/recommendations.
 */

import type { CrawlSignals, PerformanceData } from "../types";
import type { Issue } from "./types";
import { calculateSeoScore } from "./seoScore";
import { calculatePerformanceScore } from "./performanceScore";
import { calculateUxScore } from "./uxScore";
import { calculateConversionScore } from "./conversionScore";

const WEIGHT_SEO = 0.3;
const WEIGHT_PERFORMANCE = 0.25;
const WEIGHT_UX = 0.25;
const WEIGHT_CONVERSION = 0.2;

export interface EngineResult {
  totalScore: number;
  confidence: number;
  seoScore: number;
  performanceScore: number;
  uxScore: number;
  conversionScore: number;
  issues: Issue[];
  recommendations: string[];
}

function dedupeStrings(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter((s) => {
    const n = s.trim().toLowerCase();
    if (seen.has(n)) return false;
    seen.add(n);
    return true;
  });
}

function dedupeIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter((i) => {
    const n = i.message.trim().toLowerCase();
    if (seen.has(n)) return false;
    seen.add(n);
    return true;
  });
}

/**
 * Confidence 0–100 from page content: text length, DOM-size proxy (elements), detected signals.
 */
function calculateConfidence(signals: CrawlSignals): number {
  const textLength = (signals.wordCount ?? 0) * 6;
  const headingCount = signals.headingCount ?? signals.h1Count + signals.h2Count;
  const domSize =
    (signals.internalLinks ?? 0) +
    (signals.externalLinks ?? 0) +
    (signals.imageCount ?? 0) +
    headingCount +
    (signals.formCount ?? 0);
  const textFactor = Math.min(1, textLength / 5000);
  const domFactor = Math.min(1, domSize / 200);
  const confidence = Math.round(textFactor * 50 + domFactor * 50);
  return Math.min(100, Math.max(0, confidence));
}

export function calculateScore(
  signals: CrawlSignals,
  performanceData: PerformanceData | null
): EngineResult {
  const seo = calculateSeoScore(signals);
  const perf = calculatePerformanceScore(signals, performanceData);
  const ux = calculateUxScore(signals);
  const conv = calculateConversionScore(signals);

  const totalScore = Math.round(
    seo.score * WEIGHT_SEO +
      perf.score * WEIGHT_PERFORMANCE +
      ux.score * WEIGHT_UX +
      conv.score * WEIGHT_CONVERSION
  );
  const clampedTotal = Math.max(0, Math.min(100, totalScore));
  const confidence = calculateConfidence(signals);

  const issues = dedupeIssues([
    ...seo.issues,
    ...perf.issues,
    ...ux.issues,
    ...conv.issues,
  ]);
  const recommendations = dedupeStrings([
    ...seo.recommendations,
    ...perf.recommendations,
    ...ux.recommendations,
    ...conv.recommendations,
  ]);

  return {
    totalScore: clampedTotal,
    confidence,
    seoScore: seo.score,
    performanceScore: perf.score,
    uxScore: ux.score,
    conversionScore: conv.score,
    issues,
    recommendations,
  };
}
