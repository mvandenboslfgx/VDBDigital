import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { WebsiteFixPayloadStored } from "@/modules/fixes/fix-contract";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; fixId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId, fixId } = await params;

    const fix = await prisma.websiteFix.findFirst({
      where: {
        id: fixId,
        websiteAudit: {
          websiteProjectId: projectId,
          websiteProject: { userId: user.id },
        },
      },
    });
    if (!fix) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      fix: {
        id: fix.id,
        websiteAuditId: fix.websiteAuditId,
        sourceIssueId: fix.sourceIssueId,
        kind: fix.kind,
        status: fix.status,
        approved: fix.approved,
        approvedAt: fix.approvedAt?.toISOString() ?? null,
        applied: fix.applied,
        appliedAt: fix.appliedAt?.toISOString() ?? null,
        applyResult: fix.applyResult ?? null,
        errorMessage: fix.errorMessage,
        payload: fix.payload as WebsiteFixPayloadStored,
        createdAt: fix.createdAt.toISOString(),
        updatedAt: fix.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    logger.error("[Dashboard/Fixes/GET one]", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
