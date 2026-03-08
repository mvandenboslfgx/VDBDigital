import * as cheerio from "cheerio";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import type { AuditResult } from "./types";

type CacheEntry = {
  result: AuditResult;
  expiresAt: number;
};

const auditCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

const normalizeUrl = (raw: string): string => {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
};

export async function runWebsiteAudit(rawUrl: string): Promise<AuditResult> {
  const url = normalizeUrl(rawUrl);

  const cached = auditCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
      },
    });
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError instanceof Error) {
      if (fetchError.name === "AbortError") {
        throw new Error("De website reageerde niet op tijd. Probeer het later of een andere URL.");
      }
      throw new Error(`Website niet bereikbaar: ${fetchError.message}`);
    }
    throw new Error("De website kon niet worden opgehaald.");
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(
      `De website gaf fout ${response.status} terug. Sommige sites blokkeren audits—probeer een andere URL.`
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim();
  const description =
    $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1Count = $("h1").length;
  const h2Count = $("h2").length;
  const metaRobots = $('meta[name="robots"]').attr("content") ?? "";
  const linkCount = $("a").length;
  const imgCount = $("img").length;
  const scriptCount = $("script").length;

  const analysisInput = {
    url,
    title,
    description,
    h1Count,
    h2Count,
    metaRobots,
    linkCount,
    imgCount,
    scriptCount,
  };

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior web strategist for a high-end digital studio. Analyse the given website signals and return a JSON object with fields: score (0-100), seoIssues (string[]), uxIssues (string[]), speedIssues (string[]), recommendations (string[]). Keep arrays concise and actionable.",
        },
        {
          role: "user",
          content: JSON.stringify(analysisInput),
        },
      ],
    });
  } catch (openaiError: unknown) {
    const err = openaiError as { status?: number; code?: string; message?: string; error?: { message?: string; code?: string } };
    const msg = err?.error?.message ?? err?.message ?? String(openaiError);
    if (err?.status === 401 || err?.code === "invalid_api_key" || (msg && msg.toLowerCase().includes("api key"))) {
      throw new Error("OpenAI API-key is ongeldig of ontbreekt. Controleer je .env (OPENAI_API_KEY).");
    }
    if (err?.status === 429 || err?.code === "rate_limit_exceeded" || (msg && msg.toLowerCase().includes("rate"))) {
      throw new Error("Te veel aanvragen bij OpenAI. Wacht even en probeer het opnieuw.");
    }
    throw new Error(msg || "OpenAI-fout. Controleer je API-key en saldo.");
  }

  const rawContent = completion.choices[0]?.message?.content ?? "{}";

  let parsed: AuditResult;
  try {
    const json = JSON.parse(rawContent) as Partial<AuditResult>;
    parsed = {
      score: typeof json.score === "number" ? json.score : 60,
      seoIssues: json.seoIssues ?? [],
      uxIssues: json.uxIssues ?? [],
      speedIssues: json.speedIssues ?? [],
      recommendations: json.recommendations ?? [],
    };
  } catch {
    parsed = {
      score: 60,
      seoIssues: [],
      uxIssues: [],
      speedIssues: [],
      recommendations: [
        "Unable to fully parse AI response. Re-run the audit for a fresh result.",
      ],
    };
  }

  const normalized: AuditResult = {
    ...parsed,
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
  };

  auditCache.set(url, {
    result: normalized,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return normalized;
}

export async function storeAuditResult(
  leadId: string,
  url: string,
  result: AuditResult
): Promise<void> {
  await prisma.auditResult.create({
    data: {
      leadId,
      url,
      score: result.score,
      seoIssues: result.seoIssues,
      uxIssues: result.uxIssues,
      speedIssues: result.speedIssues,
      recommendations: result.recommendations,
    },
  });
  const { computeLeadScore, getLeadScoreFactors } = await import("@/lib/crm/leadScore");
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });
  if (lead) {
    const factors = getLeadScoreFactors(lead, { score: result.score });
    const score = computeLeadScore({ ...factors, auditScore: result.score });
    await prisma.lead.update({
      where: { id: leadId },
      data: { leadScore: score },
    });
  }
}

