import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarChart } from "@/components/admin/DashboardCharts";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function getLast30Days(): { date: Date; label: string }[] {
  const out: { date: Date; label: string }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const start = startOfDay(d);
    out.push({
      date: start,
      label: start.toISOString().slice(5, 10),
    });
  }
  return out;
}

export default async function OwnerAnalyticsPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const days = getLast30Days();
  const rangeStart = days[0].date;
  const rangeEnd = new Date(days[days.length - 1].date);
  rangeEnd.setUTCHours(23, 59, 59, 999);

  const [users, usageEvents, aiUsage, invoicesPaid] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
      select: { createdAt: true },
    }),
    prisma.usageEvent.findMany({
      where: { createdAt: { gte: rangeStart, lte: rangeEnd }, event: "audit_completed" },
      select: { createdAt: true },
    }),
    prisma.aIUsage.findMany({
      where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
      select: { createdAt: true },
    }),
    prisma.invoice.findMany({
      where: { status: "paid", createdAt: { gte: rangeStart, lte: rangeEnd } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const usersByDay = days.map(({ date }) => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 1);
    const count = users.filter((u) => u.createdAt >= date && u.createdAt < next).length;
    return { label: date.toISOString().slice(5, 10), value: count };
  });

  const auditsByDay = days.map(({ date }) => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 1);
    const count = usageEvents.filter((e) => e.createdAt >= date && e.createdAt < next).length;
    return { label: date.toISOString().slice(5, 10), value: count };
  });

  const aiByDay = days.map(({ date }) => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 1);
    const count = aiUsage.filter((e) => e.createdAt >= date && e.createdAt < next).length;
    return { label: date.toISOString().slice(5, 10), value: count };
  });

  const mrrByDay: { label: string; value: number }[] = [];
  let cumulative = 0;
  for (let i = 0; i < days.length; i++) {
    const date = days[i].date;
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 1);
    const dayRevenue = invoicesPaid
      .filter((inv) => inv.createdAt >= date && inv.createdAt < next)
      .reduce((s, inv) => s + inv.amount, 0);
    cumulative += dayRevenue / 100;
    mrrByDay.push({ label: days[i].label, value: Math.round(cumulative * 100) / 100 });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">
          Users growth, MRR growth, audits per day, AI requests per day (last 30 days).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart title="Users growth (new signups per day)" data={usersByDay} />
        <BarChart title="Audits per day" data={auditsByDay} />
        <BarChart title="AI requests per day" data={aiByDay} />
        <BarChart
          title="Cumulative revenue (€)"
          data={mrrByDay}
          valueFormat={(n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0))}
        />
      </div>
    </div>
  );
}
