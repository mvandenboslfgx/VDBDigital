import { requireUser } from "@/lib/auth";

export default async function DashboardAnalyticsPage() {
  const user = await requireUser();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-zinc-500">
          Overzicht van je scans, rapporten en gebruik.
        </p>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-12 shadow-panel">
        <p className="text-zinc-500 text-center">
          Analytics-dashboard komt hier. Koppel aan je scan- en rapportdata voor grafieken en trends.
        </p>
      </div>
    </div>
  );
}
