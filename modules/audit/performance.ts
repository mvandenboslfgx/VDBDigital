/**
 * Layer 2: Performance data from Google PageSpeed Insights API.
 * Returns LCP, CLS, INP, TTFB, performanceScore. Fallback to null if API fails.
 */

import type { PerformanceData } from "./types";

const PAGE_SPEED_TIMEOUT_MS = 25_000;

function parseNumericValue(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export async function fetchPerformanceData(url: string): Promise<PerformanceData | null> {
  const apiKey = process.env.PAGESPEED_API_KEY?.trim();
  const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance${keyParam}`,
      { signal: AbortSignal.timeout(PAGE_SPEED_TIMEOUT_MS), next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<string, { numericValue?: number; displayValue?: string }>;
      };
    };
    const audits = data.lighthouseResult?.audits ?? {};
    const lcpAudit = audits["largest-contentful-paint"];
    const clsAudit = audits["cumulative-layout-shift"];
    const inpAudit = audits["interaction-to-next-paint"] ?? audits["first-input-delay"];
    const ttfbAudit = audits["server-response-time"];
    const score = data.lighthouseResult?.categories?.performance?.score;

    return {
      lcp: lcpAudit ? parseNumericValue(lcpAudit.numericValue) : null,
      cls: clsAudit ? parseNumericValue(clsAudit.numericValue) : null,
      inp: inpAudit ? parseNumericValue(inpAudit.numericValue) : null,
      ttfb: ttfbAudit ? parseNumericValue(ttfbAudit.numericValue) : null,
      performanceScore: typeof score === "number" ? Math.round(score * 100) : null,
    };
  } catch {
    return null;
  }
}
