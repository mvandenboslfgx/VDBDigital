/**
 * Audit engine types. Three layers: data collection → score calculation → AI insights.
 */

/** Structured data collected from HTML (Layer 1). */
export interface CrawlSignals {
  url: string;
  title: string;
  metaDescription: string;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  canonicalTag: boolean;
  robotsMeta: string | null;
  viewportMeta: boolean;
  structuredData: boolean;
  formCount: number;
  ctaCount: number;
  wordCount: number;
  /** Optional: raw H1 text for display */
  h1Text?: string;
  /** Optional: total heading count */
  headingCount?: number;
}

/** Performance metrics from PageSpeed API (Layer 2). All in ms except score 0-100. */
export interface PerformanceData {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  performanceScore: number | null;
}

/** Deterministic scores 0-100 (Layer 3). */
export interface AuditScores {
  seoScore: number;
  uxScore: number;
  conversionScore: number;
  performanceScore: number;
}

/** Result of a full scan: real data + scores + optional AI insights + engine issues/recommendations. */
export interface ScanResult {
  signals: CrawlSignals;
  performanceData: PerformanceData | null;
  scores: AuditScores;
  scanConfidence: number;
  /** Human-readable technical summary for report */
  technicalSummary: TechnicalDataSummary;
  /** AI-generated explanations only (no score logic) */
  aiInsights?: string;
  aiInsightsShort?: string;
  /** Structured issues from scoring engine (with severity) */
  issues?: Array<{ severity: "critical" | "warning" | "improvement"; message: string }>;
  /** Structured recommendations from scoring engine */
  recommendations?: string[];
  /** Weighted total score (SEO 30%, Perf 25%, UX 25%, Conv 20%) */
  totalScore?: number;
  /** Engine confidence 0–100 (page content/DOM) */
  engineConfidence?: number;
}

export interface TechnicalDataSummary {
  h1Count: number;
  h2Count: number;
  imagesMissingAlt: number;
  imageCount: number;
  internalLinks: number;
  externalLinks: number;
  canonicalPresent: boolean;
  metaDescriptionPresent: boolean;
  metaDescriptionLength: number;
  viewportPresent: boolean;
  structuredDataPresent: boolean;
  formCount: number;
  ctaCount: number;
  wordCount: number;
}

export type CrawlErrorKind = "INVALID_URL" | "TIMEOUT" | "BLOCKED" | "FETCH_ERROR";

export type CrawlResult =
  | { success: true; signals: CrawlSignals }
  | { success: false; error: CrawlErrorKind; message: string };
