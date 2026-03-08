import { openai } from "@/lib/openai";
import type {
  CompetitorAnalyzerInput,
  CompetitorAnalysisResult,
} from "./types";

type CacheEntry = {
  result: CompetitorAnalysisResult;
  expiresAt: number;
};
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 20 * 60 * 1000;

export async function analyzeCompetitors(
  input: CompetitorAnalyzerInput
): Promise<CompetitorAnalysisResult> {
  const key = JSON.stringify(input);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a senior digital strategist. Given an industry and city, return a JSON object with:
- topCompetitors: array of { name, url (optional), seoScore (0-100), designQuality (short label), strengths (string[]), gaps (string[]) }
- seoComparison: array of 3-5 bullet strings comparing typical SEO in this market
- designQualitySummary: one short paragraph on design quality in the market
- marketingGaps: array of 3-5 common marketing gaps in this industry/location
- recommendations: array of 3-5 actionable recommendations
Use Dutch for all text. Keep data realistic and concise.`,
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: CompetitorAnalysisResult;
  try {
    const json = JSON.parse(raw) as Partial<CompetitorAnalysisResult>;
    parsed = {
      topCompetitors: Array.isArray(json.topCompetitors) ? json.topCompetitors : [],
      seoComparison: Array.isArray(json.seoComparison) ? json.seoComparison : [],
      designQualitySummary: json.designQualitySummary ?? "",
      marketingGaps: Array.isArray(json.marketingGaps) ? json.marketingGaps : [],
      recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
    };
  } catch {
    parsed = {
      topCompetitors: [],
      seoComparison: [],
      designQualitySummary: "",
      marketingGaps: [],
      recommendations: [],
    };
  }

  cache.set(key, { result: parsed, expiresAt: Date.now() + CACHE_TTL_MS });
  return parsed;
}
