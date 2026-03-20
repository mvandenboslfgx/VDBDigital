import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { addWebsiteFixJob, isWebsiteFixQueueAvailable } from "@/modules/fixes/queue";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { websiteFixCreateBodySchema, safeParse } from "@/lib/validation";
import { auditFixIssueSchema } from "@/modules/audit/fix-contract";
import type { WebsiteAuditResultPayload } from "@/modules/audit/fix-contract";
import type { WebsiteFixInput, WebsiteFixPayloadStored } from "@/modules/fixes/fix-contract";

export const runtime = "nodejs";

/**
 * GET — list fixes for a website audit (optional ?auditId=)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("auditId")?.trim();

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fixes = await prisma.websiteFix.findMany({
      where: {
        ...(auditId ? { websiteAuditId: auditId } : {}),
        websiteAudit: {
          websiteProjectId: projectId,
        },
      },
      orderBy: { createdAt: "desc" },
      take: auditId ? 50 : 20,
      select: {
        id: true,
        websiteAuditId: true,
        sourceIssueId: true,
        kind: true,
        status: true,
        approved: true,
        approvedAt: true,
        applied: true,
        appliedAt: true,
        applyResult: true,
        payload: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      fixes: fixes.map((f) => ({
        id: f.id,
        websiteAuditId: f.websiteAuditId,
        sourceIssueId: f.sourceIssueId,
        kind: f.kind,
        status: f.status,
        approved: f.approved,
        approvedAt: f.approvedAt?.toISOString() ?? null,
        applied: f.applied,
        appliedAt: f.appliedAt?.toISOString() ?? null,
        applyResult: f.applyResult ?? null,
        errorMessage: f.errorMessage,
        payload: f.payload as WebsiteFixPayloadStored,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
    });
  } catch (e) {
    logger.error("[Dashboard/Fixes] GET", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST — enqueue Fix Engine v1 (SEO meta + H1 preview)
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

    const { ok: rl } = rateLimitAi(`fix:v1:${getClientKey(request)}`);
    if (!rl) {
      return NextResponse.json({ error: "Te veel aanvragen. Probeer het zo weer." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
    }
    const parsed = safeParse(websiteFixCreateBodySchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
    }
    const { websiteAuditId, issueId } = parsed.data;
    const { projectId } = await params;

    const audit = await prisma.websiteAudit.findFirst({
      where: {
        id: websiteAuditId,
        websiteProjectId: projectId,
        websiteProject: { userId: user.id },
        status: "completed",
      },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit niet gevonden of niet voltooid." }, { status: 404 });
    }

    const result = audit.result as WebsiteAuditResultPayload | null;
    if (!result?.issues?.length) {
      return NextResponse.json({ error: "Geen issues in dit auditrapport." }, { status: 400 });
    }

    const rawIssue = result.issues.find((i) => i.id === issueId);
    if (!rawIssue) {
      return NextResponse.json({ error: "Issue niet gevonden." }, { status: 404 });
    }

    const issue = auditFixIssueSchema.safeParse(rawIssue);
    if (!issue.success || issue.data.type !== "seo") {
      return NextResponse.json(
        { error: "Deze fix is alleen beschikbaar voor SEO-issues (meta + H1)." },
        { status: 400 }
      );
    }

    if (!result.pageMeta) {
      return NextResponse.json(
        {
          error:
            "Voer opnieuw een AI-audit uit voor dit domein — dan worden meta-gegevens opgeslagen voor de fix-engine.",
        },
        { status: 400 }
      );
    }

    if (!isWebsiteFixQueueAvailable()) {
      return NextResponse.json(
        {
          error:
            "Fix-queue niet beschikbaar. Zet REDIS_URL en start de worker (npm run fix:worker).",
        },
        { status: 503 }
      );
    }

    const input: WebsiteFixInput = {
      pageUrl: audit.url,
      pageMeta: result.pageMeta,
      issue: issue.data,
    };

    const fixRow = await prisma.websiteFix.create({
      data: {
        websiteAuditId: audit.id,
        sourceIssueId: issueId,
        kind: "meta_h1_v1",
        status: "pending",
        payload: { input } as unknown as Prisma.InputJsonValue,
      },
    });

    const jobId = await addWebsiteFixJob({ websiteFixId: fixRow.id });
    if (!jobId) {
      await prisma.websiteFix.update({
        where: { id: fixRow.id },
        data: { status: "failed", errorMessage: "Kon fix-job niet queue-en." },
      });
      return NextResponse.json({ error: "Queue error" }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      fixId: fixRow.id,
      jobId,
      statusUrl: `/api/dashboard/fix-jobs/status?jobId=${encodeURIComponent(jobId)}`,
    });
  } catch (e) {
    logger.error("[Dashboard/Fixes] POST", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
