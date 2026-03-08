import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getCurrentUser } from "@/lib/auth";
import { validateOrigin } from "@/lib/apiSecurity";

const BRAND = "VDB Digital – AI Website Audit";

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Inloggen vereist" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const score = Number(body.score) || 0;
    const scores = body.scores || {};
    const issues: Array<{ severity?: string; message?: string }> = Array.isArray(body.issues) ? body.issues : [];
    const recommendations: string[] = Array.isArray(body.recommendations) ? body.recommendations : [];
    const url = typeof body.url === "string" ? body.url.slice(0, 200) : "";

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let y = height - 50;

    const drawText = (text: string, size: number, bold = false, maxWidth?: number) => {
      const f = bold ? fontBold : font;
      const lines = maxWidth ? wrapText(text, maxWidth, size, f) : [text];
      for (const line of lines) {
        if (y < 50) break;
        page.drawText(line, { x: 50, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
        y -= size + 2;
      }
    };

    page.drawText(BRAND, { x: 50, y, size: 16, font: fontBold, color: rgb(0.2, 0.27, 0.45) });
    y -= 24;
    drawText("Auditrapport", 14, true);
    y -= 8;
    if (url) {
      drawText(`Website: ${url}`, 10);
      y -= 6;
    }
    drawText(`Totaalscore: ${score}/100`, 12, true);
    y -= 12;

    const cat = [
      { label: "SEO", value: scores.seoScore },
      { label: "Performance", value: scores.perfScore },
      { label: "UX", value: scores.uxScore },
      { label: "Conversie", value: scores.convScore },
    ].filter((c) => c.value != null);
    if (cat.length) {
      drawText("Scores per categorie", 11, true);
      cat.forEach((c) => drawText(`${c.label}: ${c.value}/100`, 10));
      y -= 8;
    }

    if (issues.length > 0) {
      drawText("Aandachtspunten", 11, true);
      issues.slice(0, 15).forEach((i) => {
        const msg = typeof i === "object" && i.message ? i.message : String(i);
        const sev = typeof i === "object" && i.severity ? `[${i.severity}] ` : "";
        drawText(`• ${sev}${msg}`, 9, false, width - 100);
      });
      y -= 8;
    }

    if (recommendations.length > 0) {
      drawText("Aanbevelingen", 11, true);
      recommendations.slice(0, 10).forEach((r) => drawText(`• ${r}`, 9, false, width - 100));
      y -= 8;
    }

    y -= 20;
    page.drawText(`Rapport gegenereerd door ${BRAND}`, { x: 50, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) });

    const pdfBytes = await doc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vdb-audit-${Date.now()}.pdf"`,
      },
    });
  } catch (e) {
    console.error("[AuditExport]", e);
    return NextResponse.json({ error: "Export mislukt" }, { status: 500 });
  }
}

function wrapText(text: string, maxWidth: number, fontSize: number, font: { widthOfTextAtSize: (t: string, s: number) => number }): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
