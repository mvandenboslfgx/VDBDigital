/**
 * Full scan pipeline: Layer 1 (collect) → Layer 2 (performance) → Layer 3 (scores) → confidence → AI insights.
 * Deterministic: same URL/same HTML → same scores. AI only for explanations.
 */

import { getRelevantAd } from "@/lib/ads";
import { collectSignals } from "./crawler";
import { fetchPerformanceData } from "./performance";
import { buildTechnicalSummary } from "./scoring";
import { calculateScore } from "./engine";
import { generateAiInsights } from "./insights";
import type { ScanResult, CrawlSignals } from "./types";

export interface RunScanOptions {
  fullReport?: boolean;
  skipAi?: boolean;
}

/**
 * Run a full website scan. Returns real, verifiable results.
 * scanConfidence: 100 = HTML + PageSpeed OK; decreases on timeout/failures.
 */
export async function runScan(
  rawUrl: string,
  options: RunScanOptions = {}
): Promise<ScanResult> {
  const { fullReport = true, skipAi = false } = options;

  const crawlResult = await collectSignals(rawUrl);
  if (!crawlResult.success) {
    return {
      signals: getEmptySignals(rawUrl),
      performanceData: null,
      scores: { seoScore: 0, uxScore: 0, conversionScore: 0, performanceScore: 0 },
      scanConfidence: 0,
      technicalSummary: getEmptyTechnical(),
      aiInsights: crawlResult.message,
    };
  }

  const signals = crawlResult.signals;
  const performanceData = await fetchPerformanceData(signals.url);
  const engineResult = calculateScore(signals, performanceData);
  const scores = {
    seoScore: engineResult.seoScore,
    uxScore: engineResult.uxScore,
    conversionScore: engineResult.conversionScore,
    performanceScore: engineResult.performanceScore,
  };
  const technicalSummary = buildTechnicalSummary(signals);

  let scanConfidence = 100;
  if (!performanceData) scanConfidence -= 20;
  if (performanceData?.performanceScore === null && performanceData?.lcp === null) scanConfidence -= 10;

  let aiInsights: string | undefined;
  let aiInsightsShort: string | undefined;
  if (!skipAi) {
    const adScores = {
      seoScore: scores.seoScore,
      perfScore: scores.performanceScore,
      uxScore: scores.uxScore,
      convScore: scores.conversionScore,
    };
    const activeAd = await getRelevantAd(adScores).then((ad) =>
      ad ? { title: ad.title, description: ad.description, url: ad.url, targetMetric: ad.targetMetric } : null
    );
    const { summary, summaryShort } = await generateAiInsights(
      signals,
      scores,
      technicalSummary,
      fullReport,
      activeAd ?? undefined
    );
    aiInsights = summary;
    aiInsightsShort = summaryShort;
  }

  return {
    signals,
    performanceData,
    scores,
    scanConfidence,
    technicalSummary,
    aiInsights,
    aiInsightsShort,
    issues: engineResult.issues,
    recommendations: engineResult.recommendations,
    totalScore: engineResult.totalScore,
    engineConfidence: engineResult.confidence,
  };
}

function getEmptySignals(url: string): CrawlSignals {
  return {
    url,
    title: "",
    metaDescription: "",
    h1Count: 0,
    h2Count: 0,
    imageCount: 0,
    imagesWithoutAlt: 0,
    internalLinks: 0,
    externalLinks: 0,
    canonicalTag: false,
    robotsMeta: null,
    viewportMeta: false,
    structuredData: false,
    formCount: 0,
    ctaCount: 0,
    wordCount: 0,
  };
}

function getEmptyTechnical() {
  return {
    h1Count: 0,
    h2Count: 0,
    imagesMissingAlt: 0,
    imageCount: 0,
    internalLinks: 0,
    externalLinks: 0,
    canonicalPresent: false,
    metaDescriptionPresent: false,
    metaDescriptionLength: 0,
    viewportPresent: false,
    structuredDataPresent: false,
    formCount: 0,
    ctaCount: 0,
    wordCount: 0,
  };
}
