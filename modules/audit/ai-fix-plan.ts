/**
 * Structured AI fix plan. Scores stay authoritative from the deterministic engine;
 * the model only classifies issues and proposes concrete fixes (Dutch).
 */

import { openai, DEFAULT_CHAT_MODEL, jsonResponseFormat } from "@/lib/openai";
import type { FullAuditResult } from "@/lib/ai-website-audit";
import { auditFixPlanSchema, type AuditFixPlan, type AuditFixIssue } from "./fix-contract";

function slugId(prefix: string, i: number): string {
  return `${prefix}-${i}`;
}

export function fallbackFixPlanFromEngine(result: FullAuditResult): AuditFixPlan {
  const fromEngine = result.issues ?? [];
  const fromRec = (result.recommendations ?? []).filter((s) => s.trim().length > 0);
  const issues: AuditFixIssue[] = [];

  fromEngine.forEach((it, i) => {
    const type: AuditFixIssue["type"] =
      it.severity === "critical" ? "seo" : it.message.toLowerCase().includes("snel") ? "performance" : "ux";
    const impact: AuditFixIssue["impact"] =
      it.severity === "critical" ? "high" : it.severity === "warning" ? "medium" : "low";
    issues.push({
      id: slugId("engine", i),
      type,
      title: it.message.slice(0, 200),
      description: it.message,
      fix: `Prioriteer dit punt in je backlog en pas de pagina aan op basis van je CMS of codebase. Gebruik de technische data in het rapport voor details.`,
      impact,
    });
  });

  fromRec.slice(0, Math.max(0, 8 - issues.length)).forEach((text, j) => {
    issues.push({
      id: slugId("rec", j),
      type: "conversion",
      title: text.slice(0, 120),
      description: text,
      fix: `Werk dit uit op je belangrijkste landingspagina: concreet en meetbaar (bv. copy, CTA, formulier, trust signals).`,
      impact: "medium",
    });
  });

  if (issues.length === 0) {
    issues.push({
      id: "baseline-0",
      type: "conversion",
      title: "Versterk je primaire call-to-action",
      description: "Er zijn geen kritieke afwijkingen gedetecteerd; focus op conversie en duidelijke vervolgstappen.",
      fix: "Zet één hoofd-CTA boven de vouw, herhaar die op mobiel, en test varianten met kleine iteraties.",
      impact: "medium",
    });
  }

  return { issues: issues.slice(0, 24) };
}

export async function generateStructuredFixPlan(result: FullAuditResult): Promise<AuditFixPlan> {
  const key = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!key || key === "sk-dummy-build") {
    return fallbackFixPlanFromEngine(result);
  }

  const context = {
    scores: result.scores,
    summary: result.summary,
    technical: result.technicalSummary,
    engineIssues: result.issues ?? [],
    recommendations: result.recommendations ?? [],
    title: result.signals.title,
    url: result.signals.url,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_CHAT_MODEL,
      response_format: jsonResponseFormat,
      messages: [
        {
          role: "system",
          content: `Je bent een senior webstrateeg en technisch SEO-specialist. 
De SCORES in de context zijn al berekend en zijn LEIDEND — verander ze niet en noem ze niet opnieuw als eigen berekening.
Taak: lever ALLEEN JSON met key "issues": een array van 4 tot 14 concrete problemen met fixes.
Elk issue heeft: id (unieke slug, alleen letters, cijfers, streepjes), type ("seo"|"ux"|"performance"|"conversion"), title, description, fix (concrete stappen), impact ("low"|"medium"|"high").
Schrijf in het Nederlands. Geen markdown in strings. Baseer je uitsluitend op de gegeven data; verzin geen nieuwe meetcijfers.`,
        },
        {
          role: "user",
          content: JSON.stringify(context).slice(0, 28000),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return fallbackFixPlanFromEngine(result);
    const parsed = JSON.parse(raw) as unknown;
    const plan = auditFixPlanSchema.safeParse(parsed);
    if (!plan.success) {
      return fallbackFixPlanFromEngine(result);
    }
    return plan.data;
  } catch {
    return fallbackFixPlanFromEngine(result);
  }
}
