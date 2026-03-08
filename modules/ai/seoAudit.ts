/**
 * SEO audit AI: analyze a website URL and return SEO score, missing tags, and suggestions.
 * Fetches page content then uses OpenAI to evaluate.
 */

import { openai } from "@/lib/openai";
import { DEFAULT_CHAT_MODEL, jsonResponseFormat } from "@/lib/openai";
import { incrementAiUsage } from "@/lib/usage";

export interface SeoAuditResult {
  seoScore: number;
  missingTags: string[];
  improvementSuggestions: string[];
}

const SYSTEM_PROMPT = `You are an SEO expert. Given the text content and metadata of a web page (or a URL if content is not available), respond with a JSON object with exactly these keys:
- seoScore: number from 0 to 100 (overall SEO health)
- missingTags: array of important missing or weak elements (e.g. "meta description", "H1", "title tag")
- improvementSuggestions: array of 4-8 actionable SEO improvement suggestions (short strings)

Respond only with valid JSON, no markdown.`;

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Fetch page and extract text for analysis (title, meta, headings, body snippet). */
async function fetchPageContext(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "VDBDigital-SEOAudit/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return `URL returned ${res.status}`;
    const html = await res.text();
    // Minimal extraction: title, meta description, first 2000 chars
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    const bodyMatch = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    const textSnippet = bodyMatch.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);
    const parts = [
      titleMatch ? `Title: ${titleMatch[1].trim()}` : "Title: (none found)",
      metaDesc ? `Meta description: ${metaDesc[1].trim()}` : "Meta description: (none found)",
      h1Match ? `H1: ${h1Match[1].trim()}` : "H1: (none found)",
      `Body snippet: ${textSnippet}`,
    ];
    return parts.join("\n\n");
  } catch (e) {
    return `Could not fetch URL: ${String(e)}`;
  }
}

export async function runSeoAudit(
  websiteUrl: string,
  userId?: string | null
): Promise<SeoAuditResult> {
  const url = typeof websiteUrl === "string" ? websiteUrl.trim() : "";
  if (!url || !isValidUrl(url)) {
    return {
      seoScore: 0,
      missingTags: ["Invalid or missing URL"],
      improvementSuggestions: ["Provide a valid http(s) URL to analyze."],
    };
  }

  const pageContext = await fetchPageContext(url);
  const userMessage = `URL: ${url}\n\nPage context:\n${pageContext}`;

  const completion = await openai.chat.completions.create({
    model: DEFAULT_CHAT_MODEL,
    response_format: jsonResponseFormat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage.slice(0, 12000) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<SeoAuditResult> = {};
  try {
    parsed = JSON.parse(raw) as Partial<SeoAuditResult>;
  } catch {
    // fallback
  }

  const seoScore =
    typeof parsed.seoScore === "number" && Number.isFinite(parsed.seoScore)
      ? Math.max(0, Math.min(100, Math.round(parsed.seoScore)))
      : 50;

  const result: SeoAuditResult = {
    seoScore,
    missingTags: Array.isArray(parsed.missingTags)
      ? parsed.missingTags.filter((t) => typeof t === "string").slice(0, 15)
      : [],
    improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
      ? parsed.improvementSuggestions.filter((s) => typeof s === "string").slice(0, 10)
      : [],
  };

  if (userId) {
    void incrementAiUsage(userId, "seo-audit");
  }

  return result;
}
