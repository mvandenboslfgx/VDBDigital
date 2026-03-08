import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function shortId(): string {
  return randomBytes(8).toString("base64url").slice(0, 10);
}

/** Generate a short share slug for a report (owner only). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { reportId?: string };
  const reportId = typeof body.reportId === "string" ? body.reportId.trim() : "";
  if (!UUID_REGEX.test(reportId)) {
    return NextResponse.json({ error: "Ongeldig rapport" }, { status: 400 });
  }

  const report = await prisma.auditReport.findUnique({
    where: { id: reportId },
    include: { lead: true },
  });
  if (!report || report.lead.email !== user.email) {
    return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
  }

  if (report.shareSlug) {
    return NextResponse.json({
      shareSlug: report.shareSlug,
      shareUrl: `/report/${report.shareSlug}`,
    });
  }

  const shareSlug = shortId();
  await prisma.auditReport.update({
    where: { id: reportId },
    data: { shareSlug },
  });

  return NextResponse.json({
    shareSlug,
    shareUrl: `/report/${shareSlug}`,
  });
}
