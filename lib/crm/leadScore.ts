/**
 * Lead scoring (AI + heuristics) for agency CRM.
 * Factors: company size, website speed, SEO quality, etc.
 */

import type { AuditResult, Lead } from "@prisma/client";

const DEFAULT_SCORE = 0;
const MAX_SCORE = 100;

export interface LeadScoreFactors {
  auditScore?: number | null;
  hasCompany?: boolean;
  messageLength?: number;
  hasWebsite?: boolean;
}

/**
 * Compute a simple lead score 0–100 from available signals.
 * Can be extended with AI or more heuristics later.
 */
export function computeLeadScore(factors: LeadScoreFactors): number {
  let score = DEFAULT_SCORE;

  // Audit result (e.g. bad SEO/speed = higher intent to fix)
  if (factors.auditScore != null) {
    if (factors.auditScore < 50) score += 15;
    else if (factors.auditScore < 70) score += 10;
  }

  // Has company name
  if (factors.hasCompany) score += 10;

  // Message length (more detail = higher intent)
  if (factors.messageLength != null) {
    if (factors.messageLength >= 200) score += 20;
    else if (factors.messageLength >= 100) score += 10;
  }

  // Has website URL
  if (factors.hasWebsite) score += 10;

  return Math.min(MAX_SCORE, Math.max(0, score));
}

export function getLeadScoreFactors(
  lead: Pick<Lead, "company" | "message" | "website">,
  auditResult?: Pick<AuditResult, "score"> | null
): LeadScoreFactors {
  return {
    auditScore: auditResult?.score,
    hasCompany: Boolean(lead.company?.trim()),
    messageLength: lead.message?.length ?? 0,
    hasWebsite: Boolean(lead.website?.trim()),
  };
}
