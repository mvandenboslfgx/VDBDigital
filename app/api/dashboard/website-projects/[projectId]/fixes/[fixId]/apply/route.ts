/**
 * Apply Engine v1 — export mode: structured result + audit trail (no live CMS push).
 */

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { recordUsageEvent } from "@/lib/usage-events";
import { logger } from "@/lib/logger";
import type { WebsiteFixPayloadStored } from "@/modules/fixes/fix-contract";
import { buildApplyResultExportV1, applyResultV1Schema } from "@/modules/fixes/apply-result";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; fixId: string }> }
) {
  try {
    if (!validateCsrf(_request)) {
      return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 403 });
    }

    const { ok } = rateLimitSensitive(`fix-apply:${getClientKey(_request)}`);
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

    if (fix.applied && fix.appliedAt && fix.applyResult) {
      const parsed = applyResultV1Schema.safeParse(fix.applyResult);
      return NextResponse.json({
        ok: true,
        applied: true,
        appliedAt: fix.appliedAt.toISOString(),
        applyResult: parsed.success ? parsed.data : fix.applyResult,
        idempotent: true,
      });
    }

    if (!fix.approved || !fix.approvedAt) {
      return NextResponse.json(
        { error: "Keur eerst de preview goed voordat je toepast." },
        { status: 400 }
      );
    }

    if (fix.status !== "preview_ready") {
      return NextResponse.json(
        { error: "Alleen een voltooide preview kan worden toegepast." },
        { status: 400 }
      );
    }

    const payload = fix.payload as WebsiteFixPayloadStored;
    const applyResult = buildApplyResultExportV1(payload);
    if (!applyResult) {
      return NextResponse.json(
        { error: "Geen geldige preview om te exporteren." },
        { status: 400 }
      );
    }

    const now = new Date();
    const updated = await prisma.websiteFix.update({
      where: { id: fixId },
      data: {
        applied: true,
        appliedAt: now,
        applyResult: JSON.parse(JSON.stringify(applyResult)) as Prisma.InputJsonValue,
      },
    });

    await recordUsageEvent("fix_apply_exported", user.id, {
      fixId,
      websiteAuditId: fix.websiteAuditId,
      kind: fix.kind,
      sourceIssueId: fix.sourceIssueId,
      mode: "export_v1",
    });

    return NextResponse.json({
      ok: true,
      applied: true,
      appliedAt: updated.appliedAt!.toISOString(),
      applyResult,
    });
  } catch (e) {
    logger.error("[Dashboard/Fixes/Apply]", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
