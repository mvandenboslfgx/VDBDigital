import type React from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ScoreRing from "@/components/ui/ScoreRing";
import { Button } from "@/components/ui";
import Panel from "@/components/ui/Panel";
import { parseReportSections } from "@/lib/parse-report-sections";
import ReportSummary from "@/components/dashboard/ReportSummary";
import ShareReportButton from "@/components/dashboard/ShareReportButton";
import TechnicalDataSection from "@/components/tools/TechnicalDataSection";

export default async function DashboardReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const report = await prisma.auditReport.findUnique({
    where: { id },
    include: { lead: true },
  });
  if (!report || report.lead.email !== user.email) notFound();

  const sections = parseReportSections(report.summary);

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/reports"
        className="inline-block text-sm font-medium text-gold hover:text-gold/90 transition-colors"
      >
        ← Terug naar rapporten
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Scanrapport
          </h1>
          <p className="mt-2 text-zinc-400">{report.url}</p>
          <p className="mt-2 text-xs text-zinc-500">
            {new Date(report.createdAt).toLocaleString("nl-NL")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/reports/audit-pdf?reportId=${report.id}`}
            download
            className="inline-block"
          >
            <Button variant="outline" size="md">
              PDF downloaden
            </Button>
          </a>
          <ShareReportButton reportId={report.id} />
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-panel">
        <div className="mb-8 text-center">
          <p className="text-label text-zinc-500">Website score</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {Math.round((report.seoScore + report.perfScore + report.uxScore + report.convScore) / 4)}{" "}
            <span className="text-2xl text-zinc-500 md:text-3xl">/ 100</span>
          </p>
          <p className="mt-2 text-sm text-zinc-500">Gemiddelde prestatie</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-8 sm:justify-between">
          <ScoreRing score={report.seoScore} label="SEO" size="md" />
          <ScoreRing score={report.perfScore} label="Performance" size="md" />
          <ScoreRing score={report.uxScore} label="UX" size="md" />
          <ScoreRing score={report.convScore} label="Conversie" size="md" />
        </div>
      </div>
      {sections ? (
        <ReportSummary sections={sections} />
      ) : (
        <Panel title="Samenvatting">
          <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300 leading-relaxed">
            {report.summary}
          </pre>
        </Panel>
      )}
      {report.technicalData &&
        typeof report.technicalData === "object" &&
        "h1Count" in (report.technicalData as object) && (
          <Panel title="Technische data">
            <TechnicalDataSection
              data={report.technicalData as unknown as React.ComponentProps<typeof TechnicalDataSection>["data"]}
              scanConfidence={report.scanConfidence ?? undefined}
            />
          </Panel>
        )}
      <Panel title="Scan opnieuw uitvoeren">
        <p className="text-sm text-zinc-400">
          Zelfde URL scannen geeft dezelfde scores (deterministisch). Ga naar{" "}
          <Link href="/tools/website-audit" className="text-gold hover:underline">
            Website-audit
          </Link>{" "}
          om opnieuw te scannen.
        </p>
      </Panel>
    </div>
  );
}
