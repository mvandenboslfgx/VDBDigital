/**
 * Ad logic: get relevant ad by lowest score, track clicks, enforce budget.
 */

import { prisma } from "@/lib/prisma";
import type { AdTargetMetric } from "@prisma/client";

export type { AdTargetMetric };

export interface RelevantAd {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  url: string;
  image: string | null;
  targetMetric: AdTargetMetric;
  companyName: string | null;
}

const SCORE_TO_METRIC: Record<string, AdTargetMetric> = {
  seo: "SEO",
  perf: "PERF",
  ux: "UX",
  conv: "CONV",
};

function getMetricFromScores(scores: {
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
}): AdTargetMetric {
  const { seoScore, perfScore, uxScore, convScore } = scores;
  const list = [
    { score: seoScore, key: "seo" as const },
    { score: perfScore, key: "perf" as const },
    { score: uxScore, key: "ux" as const },
    { score: convScore, key: "conv" as const },
  ];
  list.sort((a, b) => a.score - b.score);
  return SCORE_TO_METRIC[list[0].key] ?? "SEO";
}

/**
 * Return one relevant partner ad for the given scores (lowest score determines metric).
 * Only returns ad if: active, and (no campaign or campaign.spent < campaign.totalBudget).
 */
export async function getRelevantAd(scores: {
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
}): Promise<RelevantAd | null> {
  const metric = getMetricFromScores(scores);
  const ads = await prisma.partnerAd.findMany({
    where: {
      targetMetric: metric,
      active: true,
      OR: [
        { campaignId: null },
        { campaign: { active: true } },
      ],
    },
    include: { campaign: { select: { totalBudget: true, spent: true, cpc: true, companyName: true } } },
    take: 10,
  });

  const ad = ads.find((a) => !a.campaign || a.campaign.spent < a.campaign.totalBudget) ?? null;
  if (!ad) return null;

  return {
    id: ad.id,
    title: ad.title,
    description: ad.description,
    ctaText: ad.ctaText,
    url: ad.url,
    image: ad.image,
    targetMetric: ad.targetMetric,
    companyName: ad.campaign?.companyName ?? null,
  };
}

/**
 * Return up to `limit` relevant partner ads for the given scores (lowest score determines metric).
 * Use for dashboard "Recommended Stack" or multiple suggestions.
 */
export async function getRelevantAds(
  scores: { seoScore: number; perfScore: number; uxScore: number; convScore: number },
  limit = 3
): Promise<RelevantAd[]> {
  const metric = getMetricFromScores(scores);
  const ads = await prisma.partnerAd.findMany({
    where: {
      targetMetric: metric,
      active: true,
      OR: [
        { campaignId: null },
        { campaign: { active: true } },
      ],
    },
    include: { campaign: { select: { totalBudget: true, spent: true, cpc: true, companyName: true } } },
    take: Math.max(limit, 10),
  });

  const withBudget = ads.filter((a) => !a.campaign || a.campaign.spent < a.campaign.totalBudget);
  return withBudget.slice(0, limit).map((ad) => ({
    id: ad.id,
    title: ad.title,
    description: ad.description,
    ctaText: ad.ctaText,
    url: ad.url,
    image: ad.image,
    targetMetric: ad.targetMetric,
    companyName: ad.campaign?.companyName ?? null,
  }));
}

/** Get all PartnerAds for admin (with campaign). */
export async function getAllPartnerAds() {
  return prisma.partnerAd.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      campaign: {
        select: { id: true, companyName: true, totalBudget: true, spent: true, cpc: true, active: true },
      },
    },
  });
}

/** Get all AdCampaigns for admin. */
export async function getAllAdCampaigns() {
  return prisma.adCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { partnerAds: true },
  });
}

/**
 * Register a click: increment PartnerAd.clicks and campaign.spent by campaign.cpc.
 * Returns the destination URL for redirect, or null if ad not found / budget exceeded.
 */
export async function registerAdClick(adId: string): Promise<string | null> {
  const ad = await prisma.partnerAd.findUnique({
    where: { id: adId },
    include: { campaign: true },
  });
  if (!ad || !ad.active) return null;

  if (ad.campaignId && ad.campaign) {
    const { campaign } = ad;
    if (campaign.spent + campaign.cpc >= campaign.totalBudget) return null;
    await prisma.$transaction([
      prisma.partnerAd.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      }),
      prisma.adCampaign.update({
        where: { id: campaign.id },
        data: { spent: { increment: campaign.cpc } },
      }),
    ]);
  } else {
    await prisma.partnerAd.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });
  }

  return ad.url;
}

/** Alias for backwards compatibility. */
export const recordAdClick = registerAdClick;
