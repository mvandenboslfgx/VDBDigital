import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";

export default async function DashboardReportsPage() {
  const user = await requireUser();
  if (!user) return null;

  const leads = await prisma.lead.findMany({
    where: { email: user.email, source: "ai-website-audit" },
    orderBy: { createdAt: "desc" },
    include: { auditReports: { orderBy: { createdAt: "desc" } } },
  });

  const reports = leads.flatMap((l) =>
    l.auditReports.map((r) => ({ ...r, lead: l }))
  );

  const avg = (r: { seoScore: number; perfScore: number; uxScore: number; convScore: number }) =>
    Math.round((r.seoScore + r.perfScore + r.uxScore + r.convScore) / 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Rapporten
        </h1>
        <p className="mt-2 text-zinc-500">
          Je opgeslagen website-scanrapporten.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-12 text-center shadow-panel">
          <p className="text-zinc-500">Nog geen scanrapporten.</p>
          <Link href="/dashboard/audits" className="mt-4 inline-block">
            <Button size="md">Start je eerste scan</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/dashboard/reports/${report.id}`}
                className="block rounded-2xl border border-white/[0.06] bg-[#111113] p-6 shadow-panel transition-all hover:border-white/[0.1] hover:shadow-elevated"
              >
                <p className="font-medium text-white truncate">
                  {report.url.replace(/^https?:\/\//, "")}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Totaal {avg(report)} · SEO {report.seoScore} · Perf {report.perfScore} · UX {report.uxScore} · Conv {report.convScore}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {new Date(report.createdAt).toLocaleString("nl-NL")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
