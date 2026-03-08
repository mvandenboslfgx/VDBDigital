import * as cheerio from "cheerio";
import type { SeoAnalysisResult } from "./types";

export function analyzeSeoFromHtml(html: string, url: string): SeoAnalysisResult {
  const $ = cheerio.load(html);
  const issues: string[] = [];
  const recommendations: string[] = [];

  const title = $("title").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1Count = $("h1").length;
  const h2Count = $("h2").length;

  let score = 100;

  if (!title || title.length < 30) {
    issues.push("Meta title ontbreekt of is te kort (min. 30 tekens)");
    score -= 15;
  }
  if (title && title.length > 60) {
    issues.push("Meta title is te lang (>60 tekens)");
    score -= 5;
  }
  if (!metaDesc || metaDesc.length < 120) {
    issues.push("Meta description ontbreekt of is te kort (min. 120 tekens)");
    score -= 15;
  }
  if (metaDesc && metaDesc.length > 160) {
    issues.push("Meta description is te lang (>160 tekens)");
    score -= 5;
  }
  if (h1Count === 0) {
    issues.push("Geen H1 heading gevonden");
    score -= 20;
  }
  if (h1Count > 1) {
    issues.push("Meerdere H1 headings - gebruik één H1 per pagina");
    score -= 10;
  }
  if (h2Count === 0 && h1Count > 0) {
    recommendations.push("Overweeg H2 subheadings voor betere structuur");
  }

  const canonical = $('link[rel="canonical"]').attr("href");
  if (!canonical) {
    recommendations.push("Voeg een canonieke URL toe");
  }

  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (!ogTitle) {
    recommendations.push("Voeg Open Graph title toe voor social sharing");
  }

  const clampedScore = Math.max(0, Math.min(100, score));

  return {
    score: clampedScore,
    metaTitle: title || null,
    metaDescription: metaDesc || null,
    h1Count,
    h2Count,
    issues,
    recommendations,
  };
}
