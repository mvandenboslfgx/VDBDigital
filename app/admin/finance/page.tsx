import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";

const HOSTING_COST_EUR = Number(process.env.HOSTING_COST_EUR) || 0;
const STRIPE_FEE_PERCENT = 0.014; // 1.4%
const STRIPE_FEE_CENTS = 25; // per transaction

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Estimate AI cost from tokens (€ per 1K tokens). */
function estimateAiCost(tokens: number): number {
  return (tokens / 1000) * 0.002;
}

export default async function OwnerFinancePage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const now = new Date();
  const start = startOfMonth(now);

  const [
    paidInvoicesThisMonth,
    usersWithSubscription,
    aiUsageThisMonth,
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: "paid", createdAt: { gte: start } },
      select: { amount: true },
    }),
    prisma.user.findMany({
      where: { stripeSubscriptionId: { not: null }, planId: { not: null } },
      include: { plan: true },
    }),
    prisma.aIUsage.aggregate({
      where: { createdAt: { gte: start } },
      _sum: { tokens: true },
    }),
  ]);

  const revenueCents = paidInvoicesThisMonth.reduce((s, i) => s + i.amount, 0);
  const mrrCents = usersWithSubscription.reduce((s, u) => s + (u.plan?.price ?? 0), 0);
  const revenueEur = revenueCents / 100;
  const mrrEur = mrrCents / 100;
  const stripeFeesEstimate = revenueEur * STRIPE_FEE_PERCENT + (paidInvoicesThisMonth.length * STRIPE_FEE_CENTS) / 100;
  const aiCostEur = aiUsageThisMonth._sum.tokens
    ? estimateAiCost(aiUsageThisMonth._sum.tokens)
    : 0;
  const totalCosts = stripeFeesEstimate + aiCostEur + HOSTING_COST_EUR;
  const profit = revenueEur - totalCosts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance</h1>
        <p className="mt-1 text-sm text-gray-400">
          Revenue, costs, and profit. Hosting cost from HOSTING_COST_EUR env.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Revenue (Stripe / paid invoices this month)"
          value={`€${revenueEur.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`}
        />
        <MetricCard label="MRR" value={`€${mrrEur.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`} />
        <MetricCard
          label="Stripe fees (estimate)"
          value={`€${stripeFeesEstimate.toFixed(2)}`}
          subtext="~1.4% + €0.25/txn"
        />
        <MetricCard
          label="AI costs (this month)"
          value={`€${aiCostEur.toFixed(2)}`}
        />
        <MetricCard
          label="Hosting cost"
          value={`€${HOSTING_COST_EUR.toFixed(2)}`}
          subtext="HOSTING_COST_EUR"
        />
        <MetricCard
          label="Total costs"
          value={`€${totalCosts.toFixed(2)}`}
        />
        <MetricCard
          label="Profit"
          value={`€${profit.toFixed(2)}`}
          trend={profit >= 0 ? "up" : "down"}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/80 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Formula
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Profit = Revenue − (Stripe fees + AI costs + Hosting)
        </p>
      </div>
    </div>
  );
}
