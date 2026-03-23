import { requireUser } from "@/lib/auth";
import { getDashboardAnalyticsBundle } from "@/lib/dashboard-user-analytics";
import { AnalyticsChartsSection } from "./AnalyticsChartsSection";

export default async function DashboardAnalyticsPage() {
  const user = await requireUser();
  if (!user) return null;

  const [snapshot, usage] = await getDashboardAnalyticsBundle(user.id, user.email);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-zinc-500">
          Overzicht van je scans, rapporten en gebruik — data wordt op de server geladen (geen extra client round-trip).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5 shadow-panel">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Totaal rapporten</p>
          <p className="mt-2 text-3xl font-semibold text-white">{snapshot.totalReports}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5 shadow-panel">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Gem. score (laatste)</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {snapshot.lastScores ? `${snapshot.lastScores.avg}/100` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5 shadow-panel">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI (30 d)</p>
          <p className="mt-2 text-3xl font-semibold text-white">{usage.aiUsage}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5 shadow-panel">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Projecten</p>
          <p className="mt-2 text-3xl font-semibold text-white">{usage.projectCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-white">Scans (afgelopen 7 dagen)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Gebaseerd op je website-audits. Grafiek laadt client-side (Recharts) om de eerste HTML klein te houden.
        </p>
        <div className="mt-6">
          <AnalyticsChartsSection data={snapshot.scansByDay} />
        </div>
      </div>

      {snapshot.lastScores && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["SEO", snapshot.lastScores.seo],
              ["Performance", snapshot.lastScores.perf],
              ["UX", snapshot.lastScores.ux],
              ["Conversie", snapshot.lastScores.conv],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5 shadow-panel"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}/100</p>
              <p className="mt-1 text-xs text-zinc-600">Laatste scan</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
