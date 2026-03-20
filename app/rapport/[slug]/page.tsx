import { notFound, redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { getAuditReportForPublicView } from "@/lib/auditReportPublic";
import { ReportPublicClient, type ReportPublicClientProps } from "@/components/report/ReportPublicClient";
import { getRelevantAd } from "@/lib/ads";
import type { Metadata } from "next";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getReport(slug: string) {
  const user = await getCurrentUser();
  const email = user?.email?.trim() || null;
  if (UUID_REGEX.test(slug) && !email) {
    redirect(`/login?next=${encodeURIComponent(`/rapport/${slug}`)}`);
  }
  return getAuditReportForPublicView(slug, email);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) return { title: "Rapport niet gevonden" };
  const domain = report.url.replace(/^https?:\/\//, "").split("/")[0];
  const score = Math.round(
    (report.seoScore + report.perfScore + report.uxScore + report.convScore) / 4
  );
  return {
    title: `Website-audit: ${domain} — Score ${score}/100 | VDB Digital`,
    description: `Website-auditresultaat voor ${domain}. Score ${score}/100. Bekijk SEO, prestaties, UX en conversie-inzichten.`,
    openGraph: {
      title: `Website-audit: ${domain} — ${score}/100`,
      description: `Auditresultaat voor ${domain}. Score ${score}/100.`,
    },
  };
}

export default async function RapportPage({ params }: PageProps) {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) notFound();

  const domain = report.url.replace(/^https?:\/\//, "").split("/")[0];
  const score = Math.round(
    (report.seoScore + report.perfScore + report.uxScore + report.convScore) / 4
  );
  const topInsights = report.summary.split(/\n/).filter(Boolean).slice(0, 5);

  const cookieStore = await cookies();
  const h = await headers();
  const adsClientId = cookieStore.get("ads_client_id")?.value;
  const viewerIp = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "";
  const viewerUa = h.get("user-agent") ?? "";
  const relevantAd = await getRelevantAd(
    {
      seoScore: report.seoScore,
      perfScore: report.perfScore,
      uxScore: report.uxScore,
      convScore: report.convScore,
    },
    { clientId: adsClientId ?? undefined, viewerIp, viewerUa }
  );
  const metricLabels: Record<string, string> = {
    SEO: "SEO-optimalisatie",
    PERF: "snelheidstimalisatie",
    UX: "gebruiksvriendelijkheid",
    CONV: "conversie",
  };
  const recommendedToolsMetric = relevantAd ? metricLabels[relevantAd.targetMetric] ?? relevantAd.targetMetric : undefined;

  return (
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
          ? (report.technicalData as unknown as ReportPublicClientProps["technicalData"])
          : undefined
      }
      scanConfidence={report.scanConfidence ?? undefined}
      recommendedAd={relevantAd}
      recommendedToolsMetric={recommendedToolsMetric}
    />
  );
}
