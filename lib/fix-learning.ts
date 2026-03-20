import type { WebsiteAuditResultPayload } from "@/modules/audit/fix-contract";
import { prisma } from "@/lib/prisma";

type IssueType = "seo" | "ux" | "performance" | "conversion";

type LearningStats = {
  samples: number;
  approvalRate: number;
  successScore: number;
  confidence: number;
  finalScore: number;
  lowConfidence: boolean;
};

const DEFAULT_STATS: LearningStats = {
  samples: 0,
  approvalRate: 0,
  successScore: 0.5,
  confidence: 0,
  finalScore: 0.15,
  lowConfidence: true,
};

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Clamp learning success score before it influences ranking (avoids drift / outliers). */
export function clampSuccessScore(score: number): number {
  return Math.min(1, Math.max(0, score));
}

/**
 * Rough SEO score delta (points on 0–100 scale) from aggregated learning successScore.
 * successScore is mean of normalizeSeoDelta; inverse of y = (delta+20)/40 → delta ≈ 40y - 20.
 */
export function approxSeoScoreDeltaFromLearning(successScore: number): number {
  const safe = clampSuccessScore(successScore);
  return Math.round(40 * safe - 20);
}

function normalizeSeoDelta(delta: number): number {
  // Map roughly -20..+20 SEO delta to 0..1 score.
  return clamp01((delta + 20) / 40);
}

function extractSeoScore(result: unknown): number | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const maybeScores = (result as { scores?: unknown }).scores;
  if (!maybeScores || typeof maybeScores !== "object" || Array.isArray(maybeScores)) return null;
  const maybeSeo = (maybeScores as { seo?: unknown }).seo;
  return typeof maybeSeo === "number" && Number.isFinite(maybeSeo) ? maybeSeo : null;
}

export async function getFixLearningByIssueType(
  sampleLimit = 600
): Promise<Record<IssueType, LearningStats>> {
  const rows = await prisma.websiteFix.findMany({
    orderBy: { createdAt: "desc" },
    take: sampleLimit,
    select: {
      approved: true,
      websiteAuditId: true,
      websiteAudit: {
        select: {
          id: true,
          websiteProjectId: true,
          createdAt: true,
          result: true,
        },
      },
      payload: true,
    },
  });

  const projects = Array.from(new Set(rows.map((r) => r.websiteAudit.websiteProjectId)));
  const audits = await prisma.websiteAudit.findMany({
    where: {
      websiteProjectId: { in: projects },
      status: "completed",
    },
    select: {
      id: true,
      websiteProjectId: true,
      createdAt: true,
      result: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const auditsByProject = new Map<string, typeof audits>();
  for (const audit of audits) {
    const list = auditsByProject.get(audit.websiteProjectId) ?? [];
    list.push(audit);
    auditsByProject.set(audit.websiteProjectId, list);
  }

  const totals: Record<IssueType, number> = {
    seo: 0,
    ux: 0,
    performance: 0,
    conversion: 0,
  };
  const approvedTotals: Record<IssueType, number> = {
    seo: 0,
    ux: 0,
    performance: 0,
    conversion: 0,
  };
  const successSums: Record<IssueType, number> = {
    seo: 0,
    ux: 0,
    performance: 0,
    conversion: 0,
  };
  const successCounts: Record<IssueType, number> = {
    seo: 0,
    ux: 0,
    performance: 0,
    conversion: 0,
  };

  for (const row of rows) {
    const payload = row.payload as { input?: { issue?: { type?: unknown } } } | null;
    const issueTypeRaw = payload?.input?.issue?.type;
    if (
      issueTypeRaw !== "seo" &&
      issueTypeRaw !== "ux" &&
      issueTypeRaw !== "performance" &&
      issueTypeRaw !== "conversion"
    ) {
      continue;
    }
    const issueType = issueTypeRaw as IssueType;
    totals[issueType] += 1;
    if (!row.approved) continue;

    approvedTotals[issueType] += 1;
    const projectAudits = auditsByProject.get(row.websiteAudit.websiteProjectId) ?? [];
    const baseTime = row.websiteAudit.createdAt.getTime();
    const nextAudit = projectAudits.find((a) => a.createdAt.getTime() > baseTime);
    if (!nextAudit) continue;

    const baseSeo = extractSeoScore(row.websiteAudit.result);
    const nextSeo = extractSeoScore(nextAudit.result);
    if (baseSeo == null || nextSeo == null) continue;

    successSums[issueType] += normalizeSeoDelta(nextSeo - baseSeo);
    successCounts[issueType] += 1;
  }

  const buildStats = (type: IssueType): LearningStats => {
    const samples = totals[type];
    if (samples === 0) return DEFAULT_STATS;

    const approvalRate = approvedTotals[type] / samples;
    const rawSuccess =
      successCounts[type] > 0 ? successSums[type] / successCounts[type] : 0.5;
    const successScore = clampSuccessScore(rawSuccess);
    const confidence = Math.min(1, samples / 50);
    const finalScore = approvalRate * 0.5 + successScore * 0.3 + confidence * 0.2;
    return {
      samples,
      approvalRate,
      successScore,
      confidence,
      finalScore,
      lowConfidence: confidence < 0.4,
    };
  };

  return {
    seo: buildStats("seo"),
    ux: buildStats("ux"),
    performance: buildStats("performance"),
    conversion: buildStats("conversion"),
  };
}

export function rankIssuesWithLearning(
  result: WebsiteAuditResultPayload,
  learning: Record<IssueType, LearningStats>
): WebsiteAuditResultPayload {
  const withLearning = result.issues.map((issue) => ({
    ...issue,
    learning: learning[issue.type] ?? DEFAULT_STATS,
  }));

  withLearning.sort((a, b) => {
    const aScore =
      (a.learning?.finalScore ?? 0) +
      (a.impact === "high" ? 0.02 : a.impact === "medium" ? 0.01 : 0);
    const bScore =
      (b.learning?.finalScore ?? 0) +
      (b.impact === "high" ? 0.02 : b.impact === "medium" ? 0.01 : 0);
    return bScore - aScore;
  });

  return {
    ...result,
    issues: withLearning,
  };
}
