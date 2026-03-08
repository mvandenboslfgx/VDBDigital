/**
 * Deterministic scoring tests. Same signals must produce same scores.
 * Run with: npx tsx modules/audit/__tests__/scoring.test.ts
 */

import {
  calculateSeoScore,
  calculateUXScore,
  calculateConversionScore,
  calculatePerformanceScore,
  calculateAllScores,
} from "../scoring";
import type { CrawlSignals, PerformanceData } from "../types";

function makeSignals(overrides: Partial<CrawlSignals> = {}): CrawlSignals {
  return {
    url: "https://example.com",
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
    ...overrides,
  };
}

function assertInRange(n: number, min: number, max: number, label: string) {
  if (n < min || n > max) {
    throw new Error(`${label} expected ${min}-${max}, got ${n}`);
  }
}

// --- SEO score ---
const seoGood = makeSignals({
  title: "Example Page Title Here",
  metaDescription: "A meta description between 50 and 160 characters is ideal for search results and social sharing.",
  h1Count: 1,
  h1Text: "Welcome",
  imageCount: 10,
  imagesWithoutAlt: 1,
  canonicalTag: true,
  internalLinks: 20,
  structuredData: true,
  viewportMeta: true,
  robotsMeta: "index, follow",
});
const seoScoreGood = calculateSeoScore(seoGood);
assertInRange(seoScoreGood, 70, 100, "SEO good");

const seoBad = makeSignals({ title: "", metaDescription: "", h1Count: 0, imageCount: 5, imagesWithoutAlt: 5 });
const seoScoreBad = calculateSeoScore(seoBad);
assertInRange(seoScoreBad, 0, 40, "SEO bad");

// Reproducibility: same input → same output
const seoAgain = calculateSeoScore(seoGood);
if (seoAgain !== seoScoreGood) throw new Error("SEO score must be deterministic");

// --- UX score ---
const uxGood = makeSignals({
  headingCount: 8,
  h2Count: 4,
  internalLinks: 30,
  externalLinks: 5,
  wordCount: 800,
  imageCount: 10,
  imagesWithoutAlt: 1,
  viewportMeta: true,
});
const uxScoreGood = calculateUXScore(uxGood);
assertInRange(uxScoreGood, 70, 100, "UX good");

// --- Conversion score ---
const convGood = makeSignals({
  ctaCount: 3,
  formCount: 1,
  title: "Buy Now",
  metaDescription: "Get started",
  h1Text: "Sign up",
  internalLinks: 10,
});
const convScoreGood = calculateConversionScore(convGood);
assertInRange(convScoreGood, 80, 100, "Conversion good");

// --- Performance: with PageSpeed ---
const perfFromApi: PerformanceData = {
  lcp: 1200,
  cls: 0.05,
  inp: 80,
  ttfb: 200,
  performanceScore: 85,
};
const signalsAny = makeSignals({ imageCount: 5, wordCount: 500 });
const perfScoreWithApi = calculatePerformanceScore(signalsAny, perfFromApi);
if (perfScoreWithApi !== 85) throw new Error("Performance score must use PageSpeed when available");

// --- Performance: fallback when API null ---
const perfScoreFallback = calculatePerformanceScore(signalsAny, null);
assertInRange(perfScoreFallback, 50, 100, "Performance fallback");

// --- calculateAllScores ---
const all = calculateAllScores(seoGood, perfFromApi);
if (all.seoScore !== seoScoreGood) throw new Error("calculateAllScores SEO");
if (all.performanceScore !== 85) throw new Error("calculateAllScores performance");
assertInRange(all.uxScore, 0, 100, "all.uxScore");
assertInRange(all.conversionScore, 0, 100, "all.conversionScore");

console.log("All scoring tests passed. Scores are deterministic.");
console.log("  SEO (good):", seoScoreGood);
console.log("  SEO (bad):", seoScoreBad);
console.log("  UX (good):", uxScoreGood);
console.log("  Conversion (good):", convScoreGood);
console.log("  Performance (PageSpeed):", perfScoreWithApi);
console.log("  Performance (fallback):", perfScoreFallback);
