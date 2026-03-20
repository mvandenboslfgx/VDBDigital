/**
 * Apply Engine v0 — record explicit user approval of a preview (no live CMS push).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { recordUsageEvent } from "@/lib/usage-events";
import { logger } from "@/lib/logger";
import type { WebsiteFixPayloadStored } from "@/modules/fixes/fix-contract";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; fixId: string }> }
) {
  try {
    if (!validateCsrf(_request)) {
      return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 403 });
    }

    const { ok } = rateLimitSensitive(`fix-approve:${getClientKey(_request)}`);
    if (!ok) {
      return NextResponse.json({ error: "Te veel aanvragen." }, { status: 429 });
    }

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

    if (fix.approved && fix.approvedAt) {
      return NextResponse.json({
        ok: true,
        approved: true,
        approvedAt: fix.approvedAt.toISOString(),
        idempotent: true,
      });
    }

    if (fix.status !== "preview_ready") {
      return NextResponse.json(
        { error: "Alleen previews die klaar zijn kunnen worden goedgekeurd." },
        { status: 400 }
      );
    }

    const payload = fix.payload as WebsiteFixPayloadStored;
    if (!payload?.applied?.after) {
      return NextResponse.json({ error: "Geen preview om goed te keuren." }, { status: 400 });
    }

    const now = new Date();
    const updated = await prisma.websiteFix.update({
      where: { id: fixId },
      data: {
        approved: true,
        approvedAt: now,
      },
    });

    await recordUsageEvent("fix_approved", user.id, {
      fixId,
      websiteAuditId: fix.websiteAuditId,
      kind: fix.kind,
      sourceIssueId: fix.sourceIssueId,
    });

    return NextResponse.json({
      ok: true,
      approved: true,
      approvedAt: updated.approvedAt!.toISOString(),
    });
  } catch (e) {
    logger.error("[Dashboard/Fixes/Approve]", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
