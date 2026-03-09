import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AuditToolClient from "@/components/dashboard/AuditToolClient";
import DashboardWidget from "@/components/ui/DashboardWidget";
import { getScoreColorClass, getScoreColorHex } from "@/lib/scoreColor";

export default async function DashboardAuditsPage() {
  const user = await requireUser();
  if (!user) return null;

  const history = await prisma.auditHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const scores = history.map((h) => Math.round((h.seoScore + h.perfScore + h.uxScore + h.convScore) / 4));
  const latestScore = scores[0] ?? 0;
  const scoreTrend = scores.length >= 2 ? (scores[0] ?? 0) - (scores[1] ?? 0) : 0;

  return (
    <div className="space-y-8">
      <AuditToolClient initialEmail={user.email} />
      {history.length > 0 && (
        <>
          <DashboardWidget
            title="Score trend"
            subtitle="Laatste scans – gemiddelde score"
            action={{ label: "Rapporten", href: "/dashboard/reports" }}
          >
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Laatste score</p>
                <p className={`mt-1 text-3xl font-bold ${getScoreColorClass(latestScore, "text")}`}>
                  {latestScore}/100
                </p>
              </div>
              {scoreTrend !== 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">T.o.v. vorige</p>
                  <p className={`mt-1 text-xl font-semibold ${scoreTrend > 0 ? "text-green-600" : "text-orange-600"}`}>
                    {scoreTrend > 0 ? "+" : ""}{scoreTrend} pt
                  </p>
                </div>
              )}
              <div className="flex gap-1 items-end">
                {scores.slice(0, 14).map((s, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-t opacity-90"
                    style={{
                      height: `${Math.max(8, (s / 100) * 32)}px`,
                      backgroundColor: getScoreColorHex(s),
                    }}
                    title={`${s} – ${new Date(history[i].createdAt).toLocaleDateString()}`}
                  />
                ))}
              </div>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Scanhistorie"
            subtitle="Uw eerdere website-scans"
            action={{ label: "Rapporten bekijken", href: "/dashboard/reports" }}
          >
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="pb-4 pr-4">Website</th>
                    <th className="pb-4 pr-4">Score</th>
                    <th className="pb-4 pr-4">Datum</th>
                    <th className="pb-4">Actie</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {history.map((h) => {
                    const avg = Math.round((h.seoScore + h.perfScore + h.uxScore + h.convScore) / 4);
                    return (
                      <tr key={h.id} className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-medium text-slate-900">{h.website}</td>
                        <td className="py-4 pr-4">
                          <span className={`font-semibold ${getScoreColorClass(avg, "text")}`}>{avg}/100</span>
                        </td>
                        <td className="py-4 pr-4">{new Date(h.createdAt).toLocaleDateString("nl-NL")}</td>
                        <td className="py-4">
                          {h.auditReportId ? (
                            <Link
                              href={`/dashboard/reports/${h.auditReportId}`}
                              className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                              Rapport bekijken
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </>
      )}
    </div>
  );
}
