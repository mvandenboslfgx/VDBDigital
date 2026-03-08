import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("admin");
  if (!user) redirect("/login");
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      auditReports: { orderBy: { createdAt: "desc" } },
      auditResult: true,
    },
  });
  if (!lead) notFound();

  const latestReport = lead.auditReports[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <Link href="/admin/leads" className="text-sm text-gold hover:underline">
        ← Back to leads
      </Link>
      <h1 className="section-heading mt-4">Lead: {lead.name}</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs text-gray-400">Email</p>
          <p className="font-medium text-white">{lead.email}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs text-gray-400">Company</p>
          <p className="font-medium text-white">{lead.company ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs text-gray-400">Website</p>
          <p className="font-medium text-white">
            {lead.website ? (
              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                {lead.website}
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs text-gray-400">Lead score</p>
          <p className="font-medium text-white">{lead.leadScore ?? "—"}</p>
        </div>
      </div>

      {latestReport && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white">Latest AI Website Audit Report</h2>
          <p className="text-xs text-gray-500">
            {new Date(latestReport.createdAt).toLocaleString()} · {latestReport.url}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
              <p className="text-xs text-gray-400">SEO</p>
              <p className="text-lg font-semibold text-white">{latestReport.seoScore}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
              <p className="text-xs text-gray-400">Performance</p>
              <p className="text-lg font-semibold text-white">{latestReport.perfScore}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
              <p className="text-xs text-gray-400">UX</p>
              <p className="text-lg font-semibold text-white">{latestReport.uxScore}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
              <p className="text-xs text-gray-400">Conversion</p>
              <p className="text-lg font-semibold text-white">{latestReport.convScore}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Summary</p>
            <div className="prose prose-invert mt-2 max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">
                {latestReport.summary}
              </pre>
            </div>
          </div>
        </div>
      )}

      {lead.auditResult && !latestReport && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white">Legacy Audit Result</h2>
          <p className="text-xs text-gray-500">
            {new Date(lead.auditResult.createdAt).toLocaleString()} · {lead.auditResult.url}
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-sm text-white">Score: {lead.auditResult.score}</p>
          </div>
        </div>
      )}

      {!latestReport && !lead.auditResult && (
        <p className="mt-8 text-gray-500">No audit report for this lead.</p>
      )}
    </div>
  );
}
