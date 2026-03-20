/**
 * Dashboard website project audit: deterministic scan + structured AI fixes, stored on WebsiteAudit + AuditHistory.
 */

import type { Prisma } from "@prisma/client";
import { runFullWebsiteAudit } from "@/lib/ai-website-audit";
import { prisma } from "@/lib/prisma";
import { incrementAuditCount } from "@/lib/audit-limits";
import { recordUsageEvent } from "@/lib/usage-events";
import { generateStructuredFixPlan } from "./ai-fix-plan";
import type { WebsiteAuditResultPayload } from "./fix-contract";
export interface WebsiteProjectAuditJobPayload {
  url: string;
  userId: string;
  websiteProjectId: string;
  websiteAuditId: string;
}

export async function processWebsiteProjectAuditJob(
  data: WebsiteProjectAuditJobPayload
): Promise<{ websiteAuditId: string }> {
  const { url, userId, websiteProjectId, websiteAuditId } = data;

  try {
    const stillValid = await prisma.websiteAudit.findFirst({
      where: {
        id: websiteAuditId,
        websiteProjectId,
        websiteProject: { userId },
      },
      select: { id: true },
    });
    if (!stillValid) {
      throw new Error("Website audit no longer valid or access changed");
    }

    const result = await runFullWebsiteAudit(url, true);
    const fixPlan = await generateStructuredFixPlan(result);

    const payload: WebsiteAuditResultPayload = {
      scores: {
        seo: result.scores.seoScore,
        performance: result.scores.perfScore,
        ux: result.scores.uxScore,
        conversion: result.scores.convScore,
      },
      issues: fixPlan.issues,
      summary: result.summary,
      summaryShort: result.summaryShort,
      engineIssues: result.issues ?? [],
      signals: { url: result.signals.url, title: result.signals.title },
      pageMeta: {
        title: result.signals.title ?? "",
        metaDescription: result.signals.metaDescription ?? "",
        h1: result.signals.h1Text ?? "",
      },
    };

    const improvements: Prisma.InputJsonValue = fixPlan.issues.map((i) => ({
      text: i.title,
      aiFix: i.fix,
    }));

    const history = await prisma.auditHistory.create({
      data: {
        userId,
        websiteProjectId,
        website: result.signals.url,
        seoScore: result.scores.seoScore,
        perfScore: result.scores.perfScore,
        uxScore: result.scores.uxScore,
        convScore: result.scores.convScore,
        summary: result.summary,
        improvements,
      },
    });

    await prisma.websiteAudit.update({
      where: { id: websiteAuditId },
      data: {
        status: "completed",
        result: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
        auditHistoryId: history.id,
      },
    });

    await incrementAuditCount(userId);
    await recordUsageEvent("audit_completed", userId, {
      websiteAuditId,
      websiteProjectId,
      auditHistoryId: history.id,
    });

    return { websiteAuditId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.websiteAudit.update({
      where: { id: websiteAuditId },
      data: {
        status: "failed",
        errorMessage: msg.slice(0, 2000),
      },
    });
    throw e;
  }
}
