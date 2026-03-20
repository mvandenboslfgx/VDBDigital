import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { addAuditJob, isAuditQueueAvailable } from "@/modules/audit/queue";
import { rateLimitAuditPerHour, getClientKey } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import {
  getMonthlyAuditLimit,
  getAndEnsureCurrentMonthCount,
} from "@/lib/audit-limits";
import type { WebsiteAuditResultPayload } from "@/modules/audit/fix-contract";
import { recordUsageEvent } from "@/lib/usage-events";
import { getFixLearningByIssueType, rankIssuesWithLearning } from "@/lib/fix-learning";

export const runtime = "nodejs";

function projectUrl(domain: string): string {
  const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
  return `https://${d}`;
}

/**
 * GET — latest structured audits for a website project (owner only).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId } = await params;
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const audits = await prisma.websiteAudit.findMany({
      where: { websiteProjectId: projectId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        url: true,
        status: true,
        result: true,
        errorMessage: true,
        createdAt: true,
        auditHistoryId: true,
      },
    });

    const learning = await getFixLearningByIssueType().catch(() => null);
    return NextResponse.json({
      project: { id: project.id, domain: project.domain },
      audits: audits.map((a) => ({
        id: a.id,
        url: a.url,
        status: a.status,
        result: (() => {
          const raw = a.result as WebsiteAuditResultPayload | null;
          if (!raw || !learning) return raw;
          return rankIssuesWithLearning(raw, learning);
        })(),
        errorMessage: a.errorMessage,
        auditHistoryId: a.auditHistoryId,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    logger.error("[Dashboard/WebsiteProjectAudit] GET", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST — enqueue full audit with structured AI fix plan (requires Redis worker).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 403 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ok: okHour } = rateLimitAuditPerHour(`audit-hour:dash:${getClientKey(request)}`);
    if (!okHour) {
      return NextResponse.json(
        { error: "Maximum scans per uur bereikt. Probeer later opnieuw." },
        { status: 429 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { plan: true },
    });
    const planName = dbUser?.plan?.name ?? null;
    const limit = getMonthlyAuditLimit(planName);
    if (limit !== null) {
      const count = await getAndEnsureCurrentMonthCount(user.id);
      if (count >= limit) {
        return NextResponse.json(
          {
            error: `Je hebt je maandelijkse auditlimiet bereikt (${limit}). Upgrade je plan voor meer.`,
          },
          { status: 429 }
        );
      }
    }

    const { projectId } = await params;
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!isAuditQueueAvailable()) {
      return NextResponse.json(
        {
          error:
            "Achtergrondscan is niet beschikbaar (Redis ontbreekt). Zet REDIS_URL en start de audit-worker, of gebruik de scan op /dashboard/audits.",
        },
        { status: 503 }
      );
    }

    const url = projectUrl(project.domain);
    const audit = await prisma.websiteAudit.create({
      data: {
        websiteProjectId: project.id,
        url,
        status: "pending",
      },
    });

    const jobId = await addAuditJob({
      url,
      userId: user.id,
      websiteProjectId: project.id,
      websiteAuditId: audit.id,
    });

    if (!jobId) {
      await prisma.websiteAudit.update({
        where: { id: audit.id },
        data: { status: "failed", errorMessage: "Kon job niet queue-en." },
      });
      return NextResponse.json({ error: "Queue error" }, { status: 503 });
    }

    await recordUsageEvent("audit_started", user.id, {
      websiteProjectId: project.id,
      websiteAuditId: audit.id,
      jobId,
      mode: "website_project",
    });

    return NextResponse.json({
      ok: true,
      jobId,
      websiteAuditId: audit.id,
      statusUrl: `/api/ai/website-audit/status?jobId=${encodeURIComponent(jobId)}`,
    });
  } catch (e) {
    logger.error("[Dashboard/WebsiteProjectAudit] POST", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
