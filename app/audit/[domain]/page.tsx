import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/metadata";
import type { Metadata } from "next";

type PublicAuditResult = {
  scores?: { seoScore: number; perfScore: number; uxScore: number; convScore: number };
  summary?: string;
  summaryShort?: string;
  signals?: { url?: string; title?: string };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const decoded = decodeURIComponent(domain).toLowerCase().replace(/^www\./, "");
  const audit = await prisma.publicAudit.findUnique({
    where: { domain: decoded },
    select: { score: true, result: true },
  });
  if (!audit) return { title: "Audit niet gevonden | VDB Digital" };
  const result = audit.result as PublicAuditResult | null;
  const canonical = `${siteUrl}/audit/${encodeURIComponent(decoded)}`;
  const description =
    result?.summary?.slice(0, 160) ||
    `Bekijk de website-analyse van ${decoded}. Score: ${audit.score}/100. Controleer uw eigen website gratis.`;
  return {
    title: `Website analyse ${decoded} – Score ${audit.score}/100 | VDB Digital`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `Website analyse ${decoded} – ${audit.score}/100`,
      description,
      url: canonical,
      type: "website",
      siteName: "VDB Digital",
    },
    twitter: {
      card: "summary_large_image",
      title: `Website analyse ${decoded} – ${audit.score}/100`,
      description,
    },
  };
}

export default async function PublicAuditPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const decoded = decodeURIComponent(domain).toLowerCase().replace(/^www\./, "");
  const audit = await prisma.publicAudit.findUnique({
    where: { domain: decoded },
    select: { id: true, domain: true, score: true, result: true, createdAt: true },
  });
  if (!audit) notFound();

  const result = (audit.result || {}) as PublicAuditResult;
  const scores = result.scores;
  const summary = result.summary || "";
  const summaryShort = result.summaryShort || "";
  const recommendations = summaryShort
    ? summaryShort.split(/[.;]\s*/).filter(Boolean).slice(0, 6)
    : [
        "Verbeter uw call-to-action",
        "Optimaliseer laadsnelheid",
        "Voeg een duidelijke waardepropositie toe",
      ];

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Website analyse ${audit.domain}`,
    description: result.summary?.slice(0, 200) || `Website-analyse van ${audit.domain}. Score: ${audit.score}/100.`,
    url: `${siteUrl}/audit/${encodeURIComponent(decoded)}`,
    datePublished: audit.createdAt,
    mainEntity: {
      "@type": "Thing",
      name: `Auditresultaat ${audit.domain}`,
      description: `Website score: ${audit.score}/100. SEO, performance, UX en conversie analyse.`,
    },
  };

  return (
    <div className="min-h-screen bg-saas-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <div className="section-container mx-auto max-w-4xl py-12 md:py-16">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Website analyse: {audit.domain}
          </h1>
          <p className="mt-2 text-slate-600">
            {(result.signals?.title || result.signals?.url) && (
              <span>{result.signals.title || result.signals.url}</span>
            )}
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-surface p-8 shadow-saas-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Website score
          </h2>
          <p className="mt-2 text-5xl font-bold text-blue-600">{audit.score}/100</p>
          {scores && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>SEO {scores.seoScore}</span>
              <span>Performance {scores.perfScore}</span>
              <span>UX {scores.uxScore}</span>
              <span>Conversie {scores.convScore}</span>
            </div>
          )}
        </section>

        {recommendations.length > 0 && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-surface p-8 shadow-saas-card">
            <h2 className="text-lg font-semibold text-slate-900">Belangrijkste aandachtspunten</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec.trim()}</li>
              ))}
            </ul>
          </section>
        )}

        {summary && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-surface p-8 shadow-saas-card">
            <h2 className="text-lg font-semibold text-slate-900">Samenvatting</h2>
            <p className="mt-4 whitespace-pre-wrap text-slate-600">{summary}</p>
          </section>
        )}

        <section className="mt-10 rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Controleer uw eigen website gratis
          </h2>
          <p className="mt-2 text-slate-600">
            Ontvang binnen een minuut een gratis analyse met scores en verbeterpunten.
          </p>
          <Link
            href="/website-scan"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Controleer uw eigen website gratis
          </Link>
        </section>

        <p className="mt-8 text-center text-sm text-slate-500">
          Analyse uitgevoerd op {new Date(audit.createdAt).toLocaleDateString("nl-NL")}
        </p>
      </div>
    </div>
  );
}
