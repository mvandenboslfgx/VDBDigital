import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeEmail } from "@/lib/apiSecurity";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Lead capture: validate email and return success so client can show full report.
 * Does not store the email again if lead exists; just validates access (report is public by link).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      reportId?: string;
      email?: string;
    };
    const reportId = typeof body.reportId === "string" ? body.reportId.trim() : "";
    const email = sanitizeEmail(body.email ?? "");
    if (!UUID_REGEX.test(reportId) || !email) {
      return NextResponse.json(
        { error: "Ongeldig rapport of e-mailadres." },
        { status: 400 }
      );
    }

    const report = await prisma.auditReport.findUnique({
      where: { id: reportId },
      include: { lead: true },
    });
    if (!report) {
      return NextResponse.json({ error: "Rapport niet gevonden." }, { status: 404 });
    }

    if (report.lead.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Dit e-mailadres hoort niet bij dit rapport. Gebruik het adres waarmee de scan is aangevraagd." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis." },
      { status: 500 }
    );
  }
}
