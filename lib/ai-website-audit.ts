/**
 * Website audit facade. Uses the deterministic 3-layer engine:
 * 1. Data collection (crawler) 2. Performance (PageSpeed) 3. Score calculation.
 * AI generates only explanations; scores are never from AI.
 * Results are cached (AuditCache) for 24h to reduce OpenAI costs.
 */

import { prisma } from "@/lib/prisma";
import { runScan } from "@/modules/audit/run-scan";
import type { CrawlSignals, ScanResult, TechnicalDataSummary } from "@/modules/audit/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Normalize URL for cache key: lowercase, no trailing slash, default https. */
export function normalizeUrlForCache(rawUrl: string): string {
  let u: string;
  try {
    const parsed = new URL(rawUrl.trim());
    u = `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/+$/, "") || "/"}${parsed.search}`;
  } catch {
    u = rawUrl.trim().toLowerCase();
  }
  return u;
}

export interface AuditSignals {
  url: string;
  title: string;
  metaDescription: string;
  h1Text: string;
  h1Count: number;
  headingCount: number;
  pageLength: number;
  linkCount: number;
  imgCount: number;
  scriptCount: number;
  canonical?: string | null;
  metaRobots?: string | null;
  imageWithAltCount?: number;
  formCount?: number;
  ctaLikeCount?: number;
  wordCount?: number;
  /** Scan confidence 0-100 */
  scanConfidence?: number;
  /** Technical data for report transparency */
  technicalSummary?: TechnicalDataSummary;
}

export interface AuditScores {
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
}

export interface FullAuditResult {
  signals: AuditSignals;
  scores: AuditScores;
  summary: string;
  summaryShort?: string;
  scanConfidence?: number;
  technicalSummary?: TechnicalDataSummary;
  /** Structured issues from engine (with severity) */
  issues?: Array<{ severity: "critical" | "warning" | "improvement"; message: string }>;
  /** Structured recommendations from engine */
  recommendations?: string[];
  /** Weighted total (SEO 30%, Perf 25%, UX 25%, Conv 20%) */
  totalScore?: number;
  /** Engine confidence 0–100 */
  confidence?: number;
}

function crawlSignalsToLegacy(signals: CrawlSignals, scanConfidence: number, technicalSummary: TechnicalDataSummary): AuditSignals {
  const linkCount = signals.internalLinks + signals.externalLinks;
  const imageWithAltCount = signals.imageCount - signals.imagesWithoutAlt;
  return {
    url: signals.url,
    title: signals.title,
    metaDescription: signals.metaDescription,
    h1Text: signals.h1Text ?? "",
    h1Count: signals.h1Count,
    headingCount: signals.headingCount ?? signals.h1Count + signals.h2Count,
    pageLength: signals.wordCount * 5,
    linkCount,
    imgCount: signals.imageCount,
    scriptCount: 0,
    canonical: signals.canonicalTag ? signals.url : null,
    metaRobots: signals.robotsMeta,
    imageWithAltCount,
    formCount: signals.formCount,
    ctaLikeCount: signals.ctaCount,
    wordCount: signals.wordCount,
    scanConfidence,
    technicalSummary,
  };
}

/**
 * Run full website audit. Uses cache if entry exists and is < 24h old; otherwise runs scan and stores result.
 */
export async function runFullWebsiteAudit(rawUrl: string, fullReport: boolean): Promise<FullAuditResult> {
  const cacheKey = normalizeUrlForCache(rawUrl);
  const cached = await prisma.auditCache.findUnique({
    where: { url: cacheKey },
    select: { score: true, result: true, createdAt: true },
  }).catch(() => null);

  if (cached && cached.result && typeof cached.result === "object") {
    const age = Date.now() - new Date(cached.createdAt).getTime();
    if (age < CACHE_TTL_MS) {
      return cached.result as unknown as FullAuditResult;
    }
  }

  const result = await runScan(rawUrl, { fullReport, skipAi: false });
  const fullResult = mapToFullAuditResult(result);
  const overallScore =
    result.totalScore ??
    Math.round(
      (fullResult.scores.seoScore + fullResult.scores.perfScore + fullResult.scores.uxScore + fullResult.scores.convScore) / 4
    );

  const resultJson = JSON.parse(JSON.stringify(fullResult));
  await prisma.auditCache.upsert({
    where: { url: cacheKey },
    create: { url: cacheKey, score: overallScore, result: resultJson },
    update: { score: overallScore, result: resultJson },
  }).catch(() => {});

  return fullResult;
}

const FALLBACK_INSIGHTS =
  "Basis analyse uitgevoerd. Verbeter je call-to-action, optimaliseer laadsnelheid en voeg een duidelijke waardepropositie toe.";
const FALLBACK_RECOMMENDATIONS = [
  "Verbeter je call-to-action",
  "Optimaliseer laadsnelheid",
  "Voeg duidelijke waardepropositie toe",
];

function mapToFullAuditResult(result: ScanResult): FullAuditResult {
  const scores: AuditScores = {
    seoScore: result.scores.seoScore,
    perfScore: result.scores.performanceScore,
    uxScore: result.scores.uxScore,
    convScore: result.scores.conversionScore,
  };
  const signals = crawlSignalsToLegacy(
    result.signals,
    result.scanConfidence,
    result.technicalSummary
  );
  const hasAiOutput =
    result.aiInsights && result.aiInsights.trim().length > 20;
  const summaryShortFallback =
    result.recommendations?.length
      ? result.recommendations.slice(0, 3).join(". ")
      : FALLBACK_RECOMMENDATIONS.join(". ");
  return {
    signals,
    scores,
    summary: hasAiOutput ? result.aiInsights! : FALLBACK_INSIGHTS,
    summaryShort: hasAiOutput ? result.aiInsightsShort ?? summaryShortFallback : summaryShortFallback,
    scanConfidence: result.scanConfidence,
    technicalSummary: result.technicalSummary,
    issues: result.issues,
    recommendations: result.recommendations,
    totalScore: result.totalScore,
    confidence: result.engineConfidence,
  };
}

/** Deterministic lead score from audit scores (for lead ranking). */
export function computeLeadScore(scores: AuditScores): number {
  const avg = (scores.seoScore + scores.perfScore + scores.uxScore + scores.convScore) / 4;
  return Math.max(0, Math.min(100, Math.round(100 - avg)));
}

/** Re-export for backward compatibility: fetch + parse only (Layer 1). */
export { collectSignals } from "@/modules/audit/crawler";
export type { CrawlResult, CrawlSignals } from "@/modules/audit/types";

/**
 * Fetch URL and return parsed signals for AI routes (competitor-website, conversion-analyzer).
 * Throws if fetch/parse fails. Returns shape with CrawlSignals + aliases (imgCount, imageWithAltCount, ctaLikeCount).
 */
export async function fetchAndParseSignals(rawUrl: string): Promise<CrawlSignals & { imgCount: number; imageWithAltCount: number; ctaLikeCount: number }> {
  const { collectSignals } = await import("@/modules/audit/crawler");
  const result = await collectSignals(rawUrl);
  if (!result.success) {
    const msg = "message" in result ? String(result.message) : "Kon website niet ophalen.";
    throw new Error(msg);
  }
  const s = result.signals;
  return {
    ...s,
    imgCount: s.imageCount,
    imageWithAltCount: s.imageCount - s.imagesWithoutAlt,
    ctaLikeCount: s.ctaCount,
  };
}
