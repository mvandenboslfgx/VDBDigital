/**
 * Performance scoring: scripts, images, page size heuristics, PageSpeed when available.
 */

import type { CrawlSignals, PerformanceData } from "../types";
import type { CategoryScoreResult, Issue } from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function calculatePerformanceScore(
  signals: CrawlSignals,
  performanceData: PerformanceData | null
): CategoryScoreResult {
  const issues: Issue[] = [];
  const recommendations: string[] = [];
  let score: number;

  if (performanceData?.performanceScore != null) {
    score = clamp(performanceData.performanceScore);
    if (performanceData.lcp != null && performanceData.lcp > 2500) {
      issues.push({ severity: "warning", message: "LCP (Largest Contentful Paint) is traag" });
      recommendations.push("Optimaliseer laadtijd van de grootste content (afbeeldingen, fonts)");
    }
    if (performanceData.cls != null && performanceData.cls > 0.1) {
      issues.push({ severity: "warning", message: "CLS (Cumulative Layout Shift) kan gebruikerservaring schaden" });
      recommendations.push("Geef afbeeldingen en embeds vaste afmetingen");
    }
    if (performanceData.inp != null && performanceData.inp > 200) {
      issues.push({ severity: "improvement", message: "Interactie-respons kan verbeterd worden" });
      recommendations.push("Verminder main-thread werk en verbeter INP");
    }
    return { score, issues, recommendations };
  }

  score = 70;
  if (signals.imageCount > 30) {
    score -= 20;
    issues.push({ severity: "warning", message: "Veel afbeeldingen kunnen de pagina vertragen" });
    recommendations.push("Optimaliseer afbeeldingen (formaat, lazy load, WebP)");
  } else if (signals.imageCount > 15) {
    score -= 10;
    recommendations.push("Overweeg afbeeldingen te optimaliseren of lazy load");
  }

  const totalImg = signals.imageCount || 1;
  const withAlt = signals.imageCount - signals.imagesWithoutAlt;
  if (totalImg > 0 && withAlt / totalImg < 0.5) {
    score -= 5;
    recommendations.push("Alt-attributen verbeteren ook toegankelijkheid en caching");
  }

  if (signals.wordCount > 10000) {
    score -= 5;
    recommendations.push("Overweeg paginering of lazy loading voor zeer lange content");
  }

  if (issues.length === 0 && score < 80) {
    recommendations.push("Meet Core Web Vitals met PageSpeed Insights voor gedetailleerd advies");
  }

  return {
    score: clamp(score),
    issues,
    recommendations,
  };
}
