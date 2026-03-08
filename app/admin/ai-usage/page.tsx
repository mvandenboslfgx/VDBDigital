import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

/** Estimate cost from tokens (€ per 1K). */
function estimateCost(tokens: number | null): number {
  if (tokens == null || tokens === 0) return 0;
  return (tokens / 1000) * 0.002;
}

export default async function OwnerAIUsagePage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const now = new Date();
  const todayStart = startOfDay(now);

  const [byTool, usageToday, aiTodayAgg] = await Promise.all([
    prisma.aIUsage.groupBy({
      by: ["tool"],
      _count: { tool: true },
      _sum: { tokens: true },
      _max: { createdAt: true },
    }),
    prisma.aIUsage.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.aIUsage.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { tokens: true },
    }),
  ]);

  const totalCostToday = estimateCost(aiTodayAgg._sum.tokens ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Usage</h1>
        <p className="mt-1 text-sm text-gray-400">
          Requests and cost by tool. Total today below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Total requests today" value={usageToday} />
        <MetricCard
          label="Total cost today"
          value={`€${totalCostToday.toFixed(4)}`}
          subtext="Estimated from tokens"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/80 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          By tool
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3 pr-4 font-medium">Tool</th>
                <th className="pb-3 pr-4 font-medium">Requests</th>
                <th className="pb-3 pr-4 font-medium">Cost</th>
                <th className="pb-3 font-medium">LastUsed</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {byTool.map((row) => {
                const cost = estimateCost(row._sum.tokens ?? 0);
                return (
                  <tr key={row.tool} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-white">{row.tool}</td>
                    <td className="py-3 pr-4">{row._count.tool}</td>
                    <td className="py-3 pr-4">€{cost.toFixed(4)}</td>
                    <td className="py-3">
                      {row._max.createdAt
                        ? new Date(row._max.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
