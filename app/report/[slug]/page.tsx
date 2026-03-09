import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReportPublicClient } from "@/components/report/ReportPublicClient";
import { ReportStructuredData } from "@/components/report/ReportStructuredData";
import { getRelevantAd } from "@/lib/ads";
import type { Metadata } from "next";

const SITE_URL = "https://vdb.digital";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) return { title: "Report not found" };
  const domain = report.url.replace(/^https?:\/\//, "").split("/")[0];
  const score = Math.round(
    (report.seoScore + report.perfScore + report.uxScore + report.convScore) / 4
  );
  return {
    title: `Website audit: ${domain} — Score ${score}/100 | VDB Digital`,
    description: `Website-auditresultaat voor ${domain}. Score ${score}/100. Bekijk SEO, performance, UX en conversie-inzichten.`,
    openGraph: {
      title: `Website audit: ${domain} — ${score}/100`,
      description: `Auditresultaat voor ${domain}. Score ${score}/100.`,
      url: `${SITE_URL}/report/${slug}`,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: `Website audit ${domain} — ${score}/100` },
    alternates: { canonical: `${SITE_URL}/report/${slug}` },
  };
}

async function getReport(slug: string) {
  const byId = UUID_REGEX.test(slug)
    ? await prisma.auditReport.findUnique({ where: { id: slug }, include: { lead: true } })
    : null;
  if (byId) return byId;
  const bySlug = await prisma.auditReport
    .findFirst({ where: { shareSlug: slug }, include: { lead: true } })
    .catch(() => null);
  return bySlug;
}

/** Revalidate report pages after 1 hour (ISR) for performance while keeping content fresh */
export const revalidate = 3600;

export default async function ReportPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) notFound();

  const domain = report.url.replace(/^https?:\/\//, "").split("/")[0];
  const score = Math.round(
    (report.seoScore + report.perfScore + report.uxScore + report.convScore) / 4
  );
  const topInsights = report.summary.split(/\n/).filter(Boolean).slice(0, 5);

  const relevantAd = await getRelevantAd({
    seoScore: report.seoScore,
    perfScore: report.perfScore,
    uxScore: report.uxScore,
    convScore: report.convScore,
  });
  const metricLabels: Record<string, string> = {
    SEO: "SEO-optimalisatie",
    PERF: "snelheidstimalisatie",
    UX: "gebruiksvriendelijkheid",
    CONV: "conversie",
  };
  const recommendedToolsMetric = relevantAd ? metricLabels[relevantAd.targetMetric] ?? relevantAd.targetMetric : undefined;

  return (
    <>
      <ReportStructuredData
        domain={domain}
        score={score}
        seoScore={report.seoScore}
        perfScore={report.perfScore}
        uxScore={report.uxScore}
        convScore={report.convScore}
        url={report.url}
        reportUrl={`${SITE_URL}/report/${slug}`}
      />
      <ReportPublicClient
      reportId={report.id}
      domain={domain}
      score={score}
      seoScore={report.seoScore}
      perfScore={report.perfScore}
      uxScore={report.uxScore}
      convScore={report.convScore}
      topInsights={topInsights}
      fullSummary={report.summary}
      improvements={
        (Array.isArray(report.improvements) ? report.improvements : []) as { text?: string; aiFix?: string }[]
      }
      technicalData={
        report.technicalData && typeof report.technicalData === "object" && !Array.isArray(report.technicalData)
          ? (report.technicalData as unknown as import("@/components/report/ReportPublicClient").ReportPublicClientProps["technicalData"])
          : undefined
      }
      scanConfidence={report.scanConfidence ?? undefined}
      recommendedAd={relevantAd}
      recommendedToolsMetric={recommendedToolsMetric}
    />
    </>
  );
}
