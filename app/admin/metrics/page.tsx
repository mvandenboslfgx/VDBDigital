import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardWidget from "@/components/ui/DashboardWidget";
import { getOrSet, ADMIN_METRICS_CACHE_KEY } from "@/lib/cache";

export default async function AdminMetricsPage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const {
    totalUsers,
    activeUsersCount,
    subscribedCount,
    aiUsageTotal,
    aiUsageThisMonth,
    calculatorTotal,
    calculatorThisMonth,
    planCounts,
    plans,
    estimatedMrr,
  } = await getOrSet(
    ADMIN_METRICS_CACHE_KEY,
    async () => {
      const [
        totalUsers,
        activeUsersCount,
        subscribedCount,
        aiUsageTotal,
        aiUsageThisMonth,
        calculatorTotal,
        calculatorThisMonth,
        planCounts,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            OR: [
              { usageEvents: { some: { createdAt: { gte: thirtyDaysAgo } } } },
              { aiUsage: { some: { createdAt: { gte: thirtyDaysAgo } } } },
              { calculatorResults: { some: { createdAt: { gte: thirtyDaysAgo } } } },
              { createdAt: { gte: thirtyDaysAgo } },
            ],
          },
        }),
        prisma.user.count({ where: { stripeSubscriptionId: { not: null } } }),
        prisma.aIUsage.count(),
        prisma.aIUsage.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.calculatorResult.count(),
        prisma.calculatorResult.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.user.groupBy({
          by: ["planId"],
          _count: { id: true },
          where: { planId: { not: null } },
        }),
      ]);
      const plans = await prisma.plan.findMany({
        where: { active: true },
        select: { id: true, name: true, price: true },
      });
      const planIdToPrice = new Map(plans.map((p) => [p.id, p.price]));
      let estimatedMrr = 0;
      for (const row of planCounts) {
        if (row.planId) {
          const price = planIdToPrice.get(row.planId);
          if (price != null) estimatedMrr += (price / 100) * row._count.id;
        }
      }
      return {
        totalUsers,
        activeUsersCount,
        subscribedCount,
        aiUsageTotal,
        aiUsageThisMonth,
        calculatorTotal,
        calculatorThisMonth,
        planCounts,
        plans,
        estimatedMrr,
      };
    },
    45_000
  );

  const planIdToName = new Map(plans.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Metrics</h1>
        <p className="mt-1 text-sm text-gray-400">
          Users, subscriptions, and usage. Revenue from plan counts (see Stripe for actual).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Active (30d)</p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeUsersCount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Subscriptions</p>
          <p className="mt-2 text-2xl font-semibold text-white">{subscribedCount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Est. MRR (€)</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {estimatedMrr.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <DashboardWidget title="AI usage" subtitle="All time and this month">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">All time</p>
            <p className="text-xl font-semibold text-white">{aiUsageTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">This month</p>
            <p className="text-xl font-semibold text-white">{aiUsageThisMonth.toLocaleString()}</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Calculator usage" subtitle="All time and this month">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">All time</p>
            <p className="text-xl font-semibold text-white">{calculatorTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">This month</p>
            <p className="text-xl font-semibold text-white">{calculatorThisMonth.toLocaleString()}</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Subscriptions by plan" subtitle="From User.planId">
        <ul className="space-y-2 text-sm">
          {planCounts.map((row) => (
            <li key={row.planId ?? "none"} className="flex justify-between text-zinc-300">
              <span>{row.planId ? planIdToName.get(row.planId) ?? row.planId : "—"}</span>
              <span>{row._count.id}</span>
            </li>
          ))}
          {planCounts.length === 0 && <p className="text-zinc-500">No subscription data</p>}
        </ul>
      </DashboardWidget>
    </div>
  );
}
