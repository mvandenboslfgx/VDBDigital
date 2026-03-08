import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { recordUsageEvent } from "@/lib/usage-events";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const key = `pdf:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen.", 429);
    }
    const user = await getCurrentUser();
    if (!user) {
      return safeJsonError("Niet geautoriseerd.", 401);
    }
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    if (!reportId || !UUID_REGEX.test(reportId)) {
      return safeJsonError("Ongeldig rapport.", 400);
    }

    const report = await prisma.auditReport.findUnique({
      where: { id: reportId },
      include: { lead: true },
    });
    if (!report || report.lead.email !== user.email) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let y = height - 50;
    const lineHeight = 14;
    const margin = 50;

    const drawText = (text: string, size = 11, bold = false) => {
      const f = bold ? fontBold : font;
      page.drawText(text.slice(0, 100), { x: margin, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
      y -= lineHeight;
    };

    page.drawText("Website Audit Report", { x: margin, y, size: 18, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 24;
    drawText(`Website: ${report.url}`, 12);
    drawText(`Date: ${new Date(report.createdAt).toLocaleString()}`, 10);
    y -= 10;

    drawText("Scores", 12, true);
    drawText(`SEO: ${report.seoScore}  |  Performance: ${report.perfScore}  |  UX: ${report.uxScore}  |  Conversion: ${report.convScore}`);
    y -= 14;

    drawText("Summary & recommendations", 12, true);
    const summaryLines = report.summary.split(/\n/).slice(0, 28);
    for (const line of summaryLines) {
      drawText(line.slice(0, 90), 10);
    }
    y -= 8;
    page.drawText("Book a strategy session: contact your account manager.", { x: margin, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });

    const pdfBytes = await doc.save();
    await recordUsageEvent("pdf_downloaded", user.id, { reportId });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="audit-report-${report.url.replace(/[^a-z0-9.-]/gi, "-").slice(0, 40)}.pdf"`,
      },
    });
  } catch (e) {
    return handleApiError(e, "Reports/AuditPdf");
  }
}
