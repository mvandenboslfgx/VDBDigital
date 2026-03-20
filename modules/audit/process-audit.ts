/**
 * Process a single audit job: run full website audit, capture lead, send email.
 * Used by the BullMQ worker.
 */

import type { Job } from "bullmq";
import { runFullWebsiteAudit } from "@/lib/ai-website-audit";
import { captureAuditLead } from "@/modules/leads/auditLead";
import { sendAuditReportEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import type { AuditJobData, AuditJobResult } from "./queue";
import { processWebsiteProjectAuditJob } from "./process-website-audit";

export async function processAuditJob(
  job: Job<AuditJobData, AuditJobResult>
): Promise<AuditJobResult> {
  const data = job.data;
  if (data.websiteAuditId && data.websiteProjectId && data.userId) {
    return processWebsiteProjectAuditJob({
      url: data.url,
      userId: data.userId,
      websiteProjectId: data.websiteProjectId,
      websiteAuditId: data.websiteAuditId,
    });
  }

  const { url, email, name, company, userId } = data;
  if (!email?.trim()) {
    throw new Error("Email is required for lead audit jobs");
  }

  const result = await runFullWebsiteAudit(url, true);

  const { reportId, leadId } = await captureAuditLead(
    {
      email,
      name: name || undefined,
      company: company || undefined,
      website: url,
    },
    result,
    userId ?? undefined
  );

  sendAuditReportEmail({
    to: email!,
    website: result.signals.url,
    summary: result.summary,
    seoScore: result.scores.seoScore,
    perfScore: result.scores.perfScore,
    uxScore: result.scores.uxScore,
    convScore: result.scores.convScore,
  }).catch((err) => logger.warn("[AuditWorker] Email failed", { error: String(err) }));

  return { reportId, leadId };
}
