import dynamic from "next/dynamic";
import Link from "next/link";
import type { AnalyticsEvent } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BarChart = dynamic(
  () => import("@/components/admin/DashboardCharts").then((m) => m.BarChart),
  { ssr: true }
);
const StatsChart = dynamic(
  () => import("@/components/admin/StatsChart").then((m) => m.default),
  { ssr: true }
);
const AdminCmsPanel = dynamic(() => import("@/components/admin/AdminCmsPanel"));

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getLast6Months() {
  const out: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`);
  }
  return out;
}

export default async function AdminDashboardPage() {
  const user = await requireUser("admin");
  if (!user) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    leads,
    projects,
    analyticsEvents,
    clients,
    invoices,
    allLeadsForChart,
    allInvoicesForChart,
    registrationEvents,
    newsletterCount,
    totalUsers,
    activeSubscriptionsCount,
    mrrAggregate,
    auditsThisMonthCount,
    totalAuditsCount,
    recentProductOrders,
    productOrdersThisMonthCount,
    productOrdersPendingCount,
    productOrderRevenueThisMonth,
    failedProductOrders24h,
    failedProductOrdersTotal,
  ] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { auditResult: true },
    }),
    prisma.project.findMany({
      include: { client: true, website: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.analyticsEvent.findMany(),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { lead: true },
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { client: true },
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.invoice.findMany({
      where: { status: "paid", createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { type: "registration", createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.newsletterSubscriber.count(),
    prisma.user.count(),
    prisma.user.count({ where: { stripeSubscriptionId: { not: null } } }),
    prisma.user
      .findMany({
        where: { stripeSubscriptionId: { not: null }, planId: { not: null } },
        select: { plan: { select: { price: true } } },
      })
      .then((users) => users.reduce((sum, u) => sum + (u.plan?.price ?? 0), 0)),
    Promise.all([
      prisma.auditReport.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.auditHistory.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]).then(([c, h]) => c + h),
    Promise.all([
      prisma.auditReport.count(),
      prisma.auditHistory.count(),
    ]).then(([c, h]) => c + h),
    prisma.productOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        email: true,
        totalCents: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.productOrder.count({
      where: { status: "paid", createdAt: { gte: startOfMonth } },
    }),
    prisma.productOrder.count({
      where: { status: "pending" },
    }),
    prisma.productOrder.aggregate({
      where: { status: "paid", createdAt: { gte: startOfMonth } },
      _sum: { totalCents: true },
    }),
    prisma.productOrder.count({
      where: {
        status: "failed",
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.productOrder.count({
      where: { status: "failed" },
    }),
  ]);

  const totalVisitors = analyticsEvents.filter(
    (e: AnalyticsEvent) => e.type === "visit"
  ).length;
  const registrationsCount = analyticsEvents.filter(
    (e: AnalyticsEvent) => e.type === "registration"
  ).length;
  const leadsThisMonth = await prisma.lead.count({
    where: { createdAt: { gte: startOfMonth } },
  });
  const activeClientsCount = await prisma.client.count({
    where: { projects: { some: {} } },
  });
  const projectsRunning = await prisma.project.count({
    where: { status: { not: "completed" } },
  });
  const revenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const leadsCount = await prisma.lead.count();
  const projectsCount = await prisma.project.count();
  const conversions =
    leadsCount > 0 ? (projectsCount / leadsCount) * 100 : 0;

  const monthLabels = getLast6Months();
  const leadsByMonth = monthLabels.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const start = d;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const count = allLeadsForChart.filter(
      (l) => l.createdAt >= start && l.createdAt <= end
    ).length;
    return { label: monthLabels[i], value: count };
  });

  const revenueByMonth = monthLabels.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const start = d;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const total = allInvoicesForChart
      .filter((inv) => inv.createdAt >= start && inv.createdAt <= end)
      .reduce((s, inv) => s + inv.amount, 0);
    return { label: monthLabels[i], value: total / 100 };
  });

  const registrationsByMonth = monthLabels.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const start = d;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const count = registrationEvents.filter(
      (e) => e.createdAt >= start && e.createdAt <= end
    ).length;
    return { label: monthLabels[i], value: count };
  });

  const mrrCents = typeof mrrAggregate === "number" ? mrrAggregate : 0;
  const conversionRate =
    totalUsers > 0
      ? Math.round((activeSubscriptionsCount / totalUsers) * 100)
      : 0;
  const saasStatsChartData = [
    { label: "Gebruikers", value: totalUsers },
    { label: "Abonnementen", value: activeSubscriptionsCount },
    { label: "Audits (maand)", value: auditsThisMonthCount },
    { label: "Totaal audits", value: totalAuditsCount },
  ];
  const productRevenueMonthCents = productOrderRevenueThisMonth._sum.totalCents ?? 0;
  const avgOrderValueCents =
    productOrdersThisMonthCount > 0
      ? Math.round(productRevenueMonthCents / productOrdersThisMonthCount)
      : 0;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
        <h1 className="section-heading">Dashboard</h1>
        <h2 className="section-title">SaaS-kerncijfers</h2>
        <p className="mt-2 text-sm text-gray-400">
          Gebruikers, abonnementen, MRR en audits deze maand.
        </p>
        <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-sm">
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Totaal gebruikers</p>
            <p className="mt-1 text-2xl font-semibold text-white">{totalUsers}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Actieve abonnementen</p>
            <p className="mt-1 text-2xl font-semibold text-white">{activeSubscriptionsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">MRR</p>
            <p className="mt-1 text-2xl font-semibold text-indigo-400">
              €{(mrrCents / 100).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Audits deze maand</p>
            <p className="mt-1 text-2xl font-semibold text-white">{auditsThisMonthCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Totaal audits</p>
            <p className="mt-1 text-2xl font-semibold text-white">{totalAuditsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Conversie (abonnement)</p>
            <p className="mt-1 text-2xl font-semibold text-white">{conversionRate}%</p>
          </div>
        </div>
        <div className="mt-6">
          <StatsChart
            title="SaaS-kerncijfers"
            data={saasStatsChartData}
            valueFormat={(n) => String(n)}
            subtitle="Vergelijking gebruikers, abonnementen en audits"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
        <h2 className="section-title">Overview</h2>
        <p className="mt-2 text-sm text-gray-400">
          Leads, projects, revenue and sentiment at a glance.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 text-sm">
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Visitors</p>
            <p className="mt-1 text-2xl font-semibold text-white">{totalVisitors}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Leads this month</p>
            <p className="mt-1 text-2xl font-semibold text-white">{leadsThisMonth}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Registrations</p>
            <p className="mt-1 text-2xl font-semibold text-white">{registrationsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Newsletter</p>
            <p className="mt-1 text-2xl font-semibold text-white">{newsletterCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Active clients</p>
            <p className="mt-1 text-2xl font-semibold text-white">{activeClientsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Projects running</p>
            <p className="mt-1 text-2xl font-semibold text-white">{projectsRunning}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Revenue</p>
            <p className="mt-1 text-2xl font-semibold text-indigo-400">
              €{(revenue / 100).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Conversion</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {conversions.toFixed(1)}%
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
        <h2 className="section-title">Commerce</h2>
        <p className="mt-2 text-sm text-gray-400">
          Productorders, omzet en orderstatus uit de nieuwe checkout flow.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Orders betaald (maand)</p>
            <p className="mt-1 text-2xl font-semibold text-white">{productOrdersThisMonthCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Orders pending</p>
            <p className="mt-1 text-2xl font-semibold text-amber-300">{productOrdersPendingCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Product omzet (maand)</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">
              €{(productRevenueMonthCents / 100).toLocaleString("nl-NL")}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-gray-400">Gem. orderwaarde</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              €{(avgOrderValueCents / 100).toLocaleString("nl-NL")}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recente productorders</h3>
            <span className="text-xs text-gray-500">Laatste {recentProductOrders.length}</span>
          </div>
          <div className="space-y-2">
            {recentProductOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-white">
                    #{order.id.slice(0, 8)} · {(order.totalCents / 100).toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
                  </p>
                  <p className="text-xs text-gray-400">{order.email ?? "onbekende e-mail"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-300">{order.status}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("nl-NL")}
                  </p>
                </div>
              </div>
            ))}
            {recentProductOrders.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">Nog geen productorders.</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/5 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-rose-100">Operations</h3>
            <Link href="/admin/orders" className="text-xs text-rose-200 hover:underline">
              Open order control center
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-rose-400/20 bg-black/40 p-3">
              <p className="text-xs text-rose-200/80">Failed orders (24u)</p>
              <p className="mt-1 text-xl font-semibold text-rose-100">{failedProductOrders24h}</p>
            </div>
            <div className="rounded-lg border border-rose-400/20 bg-black/40 p-3">
              <p className="text-xs text-rose-200/80">Failed orders (totaal)</p>
              <p className="mt-1 text-xl font-semibold text-rose-100">{failedProductOrdersTotal}</p>
            </div>
            <div className="rounded-lg border border-rose-400/20 bg-black/40 p-3">
              <p className="text-xs text-rose-200/80">Retry queue focus</p>
              <p className="mt-1 text-xl font-semibold text-rose-100">{productOrdersPendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChart
            title="Leads per month"
            data={leadsByMonth}
            valueFormat={(n) => String(n)}
          />
        </div>
        <div>
          <BarChart
            title="Revenue growth (€)"
            data={revenueByMonth}
            valueFormat={(n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))}
          />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Registrations per month"
          data={registrationsByMonth}
          valueFormat={(n) => String(n)}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
        <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Conversion rate
        </h4>
        <p className="mt-2 text-3xl font-semibold text-white">
          {conversions.toFixed(1)}%
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {projectsCount} projects from {leadsCount} leads
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent leads</h3>
            <Link href="/admin/leads" className="text-xs text-indigo-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{lead.name}</p>
                  <p className="text-xs text-gray-400">{lead.email}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {leads.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">No leads yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent projects</h3>
            <Link href="/admin/projects" className="text-xs text-indigo-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {projects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    {p.client.name} · {p.status}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">No projects yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-white">Content & packages</h3>
        <p className="mt-1 text-xs text-gray-400">
          Hero copy and package pricing used across the site.
        </p>
        <div className="mt-4">
          <AdminCmsPanel />
        </div>
      </section>
    </div>
  );
}
