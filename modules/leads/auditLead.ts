/**
 * Lead capture for website audit. When a user runs a full audit (with email),
 * capture website, generate report, and create/update lead record.
 * Optionally link to logged-in user (LeadScore, AuditHistory).
 */

import type { FullAuditResult } from "@/lib/ai-website-audit";
import { computeLeadScore } from "@/lib/ai-website-audit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { incrementAuditCount } from "@/lib/audit-limits";
import { recordUsageEvent } from "@/lib/usage-events";

const AUDIT_SOURCE = "ai-website-audit";

export interface CaptureAuditLeadInput {
  email: string;
  name?: string;
  company?: string;
  website: string;
}

export interface CaptureAuditLeadResult {
  leadId: string;
  reportId: string;
}

/**
 * Capture lead and create audit report from a full website audit.
 * If userId is provided, also increments audit count, creates LeadScore and AuditHistory.
 */
export async function captureAuditLead(
  input: CaptureAuditLeadInput,
  auditResult: FullAuditResult,
  userId?: string | null
): Promise<CaptureAuditLeadResult> {
  const { email, name, company, website } = input;
  const leadScoreValue = computeLeadScore(auditResult.scores);
  const leadName = name?.trim() || "Website Visitor";
  const leadMessage = `AI website audit requested for ${website}`;

  let lead = await prisma.lead.findUnique({ where: { email } });
  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        name: leadName,
        email,
        company: company?.trim() || null,
        message: leadMessage,
        website,
        source: AUDIT_SOURCE,
        leadScore: leadScoreValue,
      },
    });
  } else {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        name: leadName,
        company: company?.trim() ?? lead.company,
        message: leadMessage,
        website,
        leadScore: leadScoreValue,
      },
    });
  }

  const report = await prisma.auditReport.create({
    data: {
      leadId: lead.id,
      url: auditResult.signals.url,
      seoScore: auditResult.scores.seoScore,
      perfScore: auditResult.scores.perfScore,
      uxScore: auditResult.scores.uxScore,
      convScore: auditResult.scores.convScore,
      summary: auditResult.summary,
      technicalData: (auditResult.technicalSummary ?? undefined) as Prisma.InputJsonValue | undefined,
      scanConfidence: auditResult.scanConfidence ?? undefined,
    },
  });

  if (userId) {
    await incrementAuditCount(userId);
    await prisma.leadScore.create({
      data: {
        userId,
        website: auditResult.signals.url,
        score: leadScoreValue,
        seoScore: auditResult.scores.seoScore,
        perfScore: auditResult.scores.perfScore,
        uxScore: auditResult.scores.uxScore,
      },
    });
    await prisma.auditHistory.create({
      data: {
        userId,
        website: auditResult.signals.url,
        seoScore: auditResult.scores.seoScore,
        perfScore: auditResult.scores.perfScore,
        uxScore: auditResult.scores.uxScore,
        convScore: auditResult.scores.convScore,
        summary: auditResult.summary,
        auditReportId: report.id,
      },
    });
    await recordUsageEvent("audit_completed", userId, {
      website: auditResult.signals.url,
      reportId: report.id,
    });
  }

  return { leadId: lead.id, reportId: report.id };
}
