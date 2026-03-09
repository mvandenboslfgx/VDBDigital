/**
 * Legacy helper: fetch partner ads by metric.
 * Prefer getRelevantAd(scores) from lib/ads.ts for report display.
 */

import type { AdTargetMetric } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PartnerAdMetric = AdTargetMetric;

export interface PartnerAdPublic {
  id: string;
  title: string;
  description: string;
  url: string;
  targetMetric: AdTargetMetric;
}

export async function getPartnerAdsByMetric(metric: PartnerAdMetric): Promise<PartnerAdPublic[]> {
  const rows = await prisma.partnerAd.findMany({
    where: { targetMetric: metric, active: true },
    select: { id: true, title: true, description: true, url: true, targetMetric: true },
    take: 3,
  });
  return rows;
}
