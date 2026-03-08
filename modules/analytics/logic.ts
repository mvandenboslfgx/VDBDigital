import { prisma } from "@/lib/prisma";
import type { AnalyticsSummary } from "./types";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [visits, leads, projects, paidInvoices] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: "visit" } }),
    prisma.lead.count(),
    prisma.project.count(),
    prisma.invoice.findMany({ where: { status: "paid" } }),
  ]);

  const revenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const conversionRate = leads > 0 ? (projects / leads) * 100 : 0;

  return {
    totalVisitors: visits,
    totalLeads: leads,
    conversionRate,
    revenue,
  };
}
