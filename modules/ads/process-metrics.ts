/**
 * Pre-aggregate ad metrics into AdMetricsDaily to keep ranking fast.
 */

import { prisma } from "@/lib/prisma";
import { precomputeRankedAdsCache } from "@/lib/ads";

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function aggregateAdMetrics(): Promise<void> {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const today = startOfUtcDay(now);

  const events = await prisma.analyticsEvent.groupBy({
    by: ["path", "type"],
    where: {
      createdAt: { gte: since },
      path: { not: null },
      type: { in: ["ad_impression", "ad_click", "ad_conversion"] },
    },
    _count: { _all: true },
    _sum: { value: true },
  });

  for (const row of events) {
    const adId = row.path;
    if (!adId) continue;

    await prisma.adMetricsDaily.upsert({
      where: {
        adId_date: {
          adId,
          date: today,
        },
      },
      update: {
        impressions: row.type === "ad_impression" ? { increment: row._count._all ?? 0 } : undefined,
        clicks: row.type === "ad_click" ? { increment: row._count._all ?? 0 } : undefined,
        conversions: row.type === "ad_conversion" ? { increment: row._count._all ?? 0 } : undefined,
        revenueCents: row.type === "ad_conversion" ? { increment: row._sum.value ?? 0 } : undefined,
      },
      create: {
        adId,
        date: today,
        impressions: row.type === "ad_impression" ? row._count._all ?? 0 : 0,
        clicks: row.type === "ad_click" ? row._count._all ?? 0 : 0,
        conversions: row.type === "ad_conversion" ? row._count._all ?? 0 : 0,
        revenueCents: row.type === "ad_conversion" ? row._sum.value ?? 0 : 0,
      },
    });
  }

  // Keep hot ranked caches fresh for low-latency request paths.
  await precomputeRankedAdsCache().catch(() => {});
}

