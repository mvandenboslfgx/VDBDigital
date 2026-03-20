/**
 * Ad logic: get relevant ad by lowest score, track clicks, enforce budget.
 */

import { createHash, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { redisFreqCapReserve, redisGet, redisIncr, redisMGet, redisSet } from "@/lib/redis";
import type { AdTargetMetric } from "@prisma/client";

export type { AdTargetMetric };

const AD_METRICS_LOOKBACK_DAYS = Number(process.env.ADS_METRICS_LOOKBACK_DAYS ?? "7") || 7;
const AD_METRICS_RECENT_DAYS = Number(process.env.ADS_METRICS_RECENT_DAYS ?? "2") || 2;
const AD_METRICS_DECAY_RECENT_WEIGHT = Number(process.env.ADS_METRICS_DECAY_RECENT_WEIGHT ?? "0.7") || 0.7;
const AD_METRICS_DECAY_OLD_WEIGHT = Number(process.env.ADS_METRICS_DECAY_OLD_WEIGHT ?? "0.3") || 0.3;
const ADS_RPC_MAX_CENTS_PER_CLICK =
  Number(process.env.ADS_RPC_MAX_CENTS_PER_CLICK ?? "200") || 200; // 2.00€
const ADS_COLD_START_IMPRESSIONS = Number(process.env.ADS_COLD_START_IMPRESSIONS ?? "20") || 20;
const ADS_METRICS_CACHE_TTL_SECONDS = Number(process.env.ADS_METRICS_CACHE_TTL_SECONDS ?? "60") || 60;
const ADS_METRICS_CACHE_PREFIX = "ads:metrics:";
const ADS_RT_METRICS_TTL_SECONDS = Number(process.env.ADS_RT_METRICS_TTL_SECONDS ?? "21600") || 21600; // 6h
const ADS_RT_METRICS_PREFIX = "ads:rt:";
const ADS_RANKED_CACHE_TTL_SECONDS = Number(process.env.ADS_RANKED_CACHE_TTL_SECONDS ?? "30") || 30;
const ADS_RANKED_CACHE_PREFIX = "ads:ranked:";
const ADS_FREQUENCY_CAP_PER_DAY = Number(process.env.ADS_FREQUENCY_CAP_PER_DAY ?? "5") || 5;
const ADS_PRIOR_CVR = Number(process.env.ADS_PRIOR_CVR ?? "0.01") || 0.01;
const ADS_PRIOR_CVR_WEIGHT = Number(process.env.ADS_PRIOR_CVR_WEIGHT ?? "20") || 20;
const ADS_RT_METRICS_MAX_BLEND = Number(process.env.ADS_RT_METRICS_MAX_BLEND ?? "0.5") || 0.5;
/** RT weight scales as 1 - exp(-k * daily impressions) so manipulation needs sustained volume. */
const ADS_RT_CONFIDENCE_K = Number(process.env.ADS_RT_CONFIDENCE_K ?? "0.02") || 0.02;
const ADS_SERVE_LOG_SAMPLE_RATE = Math.min(
  1,
  Math.max(0, Number(process.env.ADS_SERVE_LOG_SAMPLE_RATE ?? "0.1") || 0.1)
);
const UCB_MIN_IMPRESSIONS = Number(process.env.ADS_UCB_MIN_IMPRESSIONS ?? "5") || 5;
const ADS_DEFAULT_CONVERSION_VALUE_CENTS =
  Number(process.env.ADS_DEFAULT_CONVERSION_VALUE_CENTS ?? "300") || 300;
const ADS_UCB_EXPLORATION_ALPHA = Number(process.env.ADS_UCB_EXPLORATION_ALPHA ?? "0.2") || 0.2;
const ADS_CONTEXT_BOOST_MAX = Number(process.env.ADS_CONTEXT_BOOST_MAX ?? "1.5") || 1.5;
const ADS_IMPRESSION_PROOF_PREFIX = "ads:imp:";
/** Default 10m: enough for slow navigation; key still deleted on first valid click. */
const ADS_IMPRESSION_PROOF_TTL_SECONDS = Number(process.env.ADS_IMPRESSION_PROOF_TTL_SECONDS ?? "600") || 600;

// Bayesian smoothing:
// CTR = (clicks + 1) / (impressions + 2)
// CVR = (conversions + 1) / (clicks + 2)
// RPC_norm = ((revenueCents + 1) / (clicks + 2)) / max
const SMOOTH_NUM = 1;
const SMOOTH_DEN = 2;

export interface RelevantAd {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  url: string;
  image: string | null;
  targetMetric: AdTargetMetric;
  companyName: string | null;
  campaignId: string | null;
  /** One-time proof for click validation; null when impression logging is skipped. */
  impressionId: string | null;
  placement: AdPlacement;
  contextSig: string;
  /** Until Tier-3 creatives: equals ad id. */
  creativeId: string;
}

/** Redis key for one-time impression → click binding (Tier-2.5). */
export function getImpressionProofRedisKey(impressionId: string): string {
  return `${ADS_IMPRESSION_PROOF_PREFIX}${impressionId}`;
}

/** Stable context fingerprint for impression proof + click validation (full sha256, no truncation). */
export function computeAdsContextSignature(context?: { category?: string; keywords?: string[] }): string {
  const norm = JSON.stringify({
    c: (context?.category ?? "").toLowerCase(),
    k: (context?.keywords ?? [])
      .map((k) => k.toLowerCase())
      .sort(),
  });
  return createHash("sha256")
    .update(`${norm}|${process.env.ADS_FINGERPRINT_SECRET ?? ""}`)
    .digest("hex");
}

/** UTC day bucket for viewer hashing — limits cross-session linkage (document in privacy policy). */
function getViewerSaltDayUtc(): string {
  return process.env.ADS_VIEWER_SALT_VERSION?.trim() || new Date().toISOString().slice(0, 10);
}

function shouldSampleServeLog(): boolean {
  return Math.random() < ADS_SERVE_LOG_SAMPLE_RATE;
}

function normalizeUa(ua?: string): string {
  return (ua ?? "").trim().toLowerCase().slice(0, 120);
}

function partialClientIp(ip?: string): string {
  if (!ip) return "";
  const s = ip.trim();
  if (s.includes(":")) return s.split(":").slice(0, 4).join(":") || s;
  const parts = s.split(".");
  if (parts.length >= 3) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return s;
}

function getViewerCapPrefix(options?: {
  userId?: string;
  clientId?: string;
  viewerFingerprint?: string;
  viewerIp?: string;
  viewerUa?: string;
}): string | null {
  if (!options) return null;
  if (options.userId) return `ads:user:${options.userId}:views:`;
  if (options.clientId) {
    const fp =
      options.viewerFingerprint ??
      createHash("sha256")
        .update(
          `${options.clientId}|${partialClientIp(options.viewerIp)}|${normalizeUa(options.viewerUa)}|${process.env.ADS_FINGERPRINT_SECRET ?? ""}`
        )
        .digest("hex")
        .slice(0, 24);
    return `ads:viewer:${fp}:views:`;
  }
  return null;
}

function dedupeCampaigns<T extends { campaignId: string | null }>(ads: T[]): T[] {
  const seen = new Set<string>();
  return ads.filter((ad) => {
    if (!ad.campaignId) return true;
    if (seen.has(ad.campaignId)) return false;
    seen.add(ad.campaignId);
    return true;
  });
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

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

export type AdPlacement = "hero" | "inline" | "sidebar";

function getPlacementMultiplier(placement?: AdPlacement): number {
  if (placement === "hero") return 1.5;
  if (placement === "inline") return 1.2;
  return 1.0;
}

function getRankedCacheKey(metric: AdTargetMetric, placement: AdPlacement): string {
  return `${ADS_RANKED_CACHE_PREFIX}${metric}:${placement}`;
}

async function getRealtimeMetrics(adId: string): Promise<{
  impressions: number;
  clicks: number;
  conversions: number;
  revenueCents: number;
} | null> {
  const raw = await redisGet(`${ADS_RT_METRICS_PREFIX}${adId}`);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as {
      impressions?: number;
      clicks?: number;
      conversions?: number;
      revenueCents?: number;
    };
    return {
      impressions: Number(p.impressions ?? 0),
      clicks: Number(p.clicks ?? 0),
      conversions: Number(p.conversions ?? 0),
      revenueCents: Number(p.revenueCents ?? 0),
    };
  } catch {
    return null;
  }
}

async function incrRealtimeMetrics(
  adId: string,
  delta: Partial<{ impressions: number; clicks: number; conversions: number; revenueCents: number }>
): Promise<void> {
  const key = `${ADS_RT_METRICS_PREFIX}${adId}`;
  const current = await getRealtimeMetrics(adId);
  const next = {
    impressions: (current?.impressions ?? 0) + (delta.impressions ?? 0),
    clicks: (current?.clicks ?? 0) + (delta.clicks ?? 0),
    conversions: (current?.conversions ?? 0) + (delta.conversions ?? 0),
    revenueCents: (current?.revenueCents ?? 0) + (delta.revenueCents ?? 0),
  };
  void redisSet(key, JSON.stringify(next), ADS_RT_METRICS_TTL_SECONDS);
}

/**
 * Return one relevant partner ad for the given scores (lowest score determines metric).
 * Only returns ad if: active, and (no campaign or campaign.spent < campaign.totalBudget).
 */
export async function getRelevantAd(
  scores: {
    seoScore: number;
    perfScore: number;
    uxScore: number;
    convScore: number;
  },
  options?: {
    clientId?: string;
    userId?: string;
    placement?: AdPlacement;
    useRankCache?: boolean;
    skipImpressionLog?: boolean;
    context?: { category?: string; keywords?: string[] };
    viewerFingerprint?: string;
    viewerIp?: string;
    viewerUa?: string;
  }
): Promise<RelevantAd | null> {
  const ads = await getRelevantAds(scores, 1, options);
  return ads[0] ?? null;
}

/**
 * Return up to `limit` relevant partner ads for the given scores (lowest score determines metric).
 * Use for dashboard "Recommended Stack" or multiple suggestions.
 */
export async function getRelevantAds(
  scores: { seoScore: number; perfScore: number; uxScore: number; convScore: number },
  limit = 3,
  options?: {
    clientId?: string;
    userId?: string;
    placement?: AdPlacement;
    useRankCache?: boolean;
    skipImpressionLog?: boolean;
    context?: { category?: string; keywords?: string[] };
    viewerFingerprint?: string;
    viewerIp?: string;
    viewerUa?: string;
  }
): Promise<RelevantAd[]> {
  const metric = getMetricFromScores(scores);
  const placement = options?.placement ?? "sidebar";
  const contextSig = computeAdsContextSignature(options?.context);
  const ads = await prisma.partnerAd.findMany({
    where: {
      targetMetric: metric,
      active: true,
      OR: [
        { campaignId: null },
        { campaign: { active: true } },
      ],
    },
    include: { campaign: { select: { totalBudget: true, spent: true, cpc: true, bidCpc: true, companyName: true } } },
    take: Math.max(limit, 10),
  });

  // Pre-filter eligibility BEFORE ranking (budget + pacing readiness).
  const budgetEligible = ads.filter((a) => !a.campaign || a.campaign.spent < a.campaign.totalBudget);
  const pacingByCampaignId = new Map<string, number>();
  const uniqueCampaignIds = [...new Set(budgetEligible.map((a) => a.campaignId).filter((v): v is string => !!v))];
  await Promise.all(
    uniqueCampaignIds.map(async (campaignId) => {
      const pacing = await getCampaignPacingFactor(campaignId);
      pacingByCampaignId.set(campaignId, pacing);
    })
  );
  const eligible = budgetEligible.filter((a) => {
    if (!a.campaignId) return true;
    const pacing = pacingByCampaignId.get(a.campaignId) ?? 1;
    return pacing > 0;
  });

  const pacingFiltered = budgetEligible.length - eligible.length;
  const budgetFiltered = ads.length - budgetEligible.length;

  // Cache-only request path: only recompute when cache is missing or disabled.
  let ranked = eligible;
  const allowCache = options?.useRankCache !== false;
  let cacheHit = false;
  try {
    const ids = eligible.map((a) => a.id);
    const byId = new Map(eligible.map((a) => [a.id, a]));
    const cacheKey = getRankedCacheKey(metric, placement);

    if (allowCache) {
      const cachedOrderRaw = await redisGet(cacheKey);
      if (cachedOrderRaw) {
        try {
          const cachedIds = JSON.parse(cachedOrderRaw) as string[];
          const fromCache = cachedIds.map((id) => byId.get(id)).filter((v): v is typeof eligible[number] => !!v);
          if (fromCache.length > 0) {
            cacheHit = true;
            ranked = fromCache;
          }
        } catch {
          // ignore malformed cache
        }
      }
    }

    if (!cacheHit) {
      const now = new Date();
      const lookbackStart = startOfUtcDay(addUtcDays(now, -AD_METRICS_LOOKBACK_DAYS + 1));
      const recentStart = startOfUtcDay(addUtcDays(now, -AD_METRICS_RECENT_DAYS + 1));

      const dailyRows = await prisma.adMetricsDaily.findMany({
        where: {
          adId: { in: ids },
          date: { gte: lookbackStart },
        },
        select: {
          adId: true,
          date: true,
          impressions: true,
          clicks: true,
          conversions: true,
          revenueCents: true,
        },
      });

      const impressionsById = new Map<string, number>();
      const clicksById = new Map<string, number>();
      const conversionsById = new Map<string, number>();
      const revenueById = new Map<string, number>(); // cents

      for (const row of dailyRows) {
        const weight = row.date >= recentStart ? AD_METRICS_DECAY_RECENT_WEIGHT : AD_METRICS_DECAY_OLD_WEIGHT;
        impressionsById.set(row.adId, (impressionsById.get(row.adId) ?? 0) + row.impressions * weight);
        clicksById.set(row.adId, (clicksById.get(row.adId) ?? 0) + row.clicks * weight);
        conversionsById.set(row.adId, (conversionsById.get(row.adId) ?? 0) + row.conversions * weight);
        revenueById.set(row.adId, (revenueById.get(row.adId) ?? 0) + row.revenueCents * weight);
      }

      const rtMaxW = Math.min(0.95, Math.max(0, ADS_RT_METRICS_MAX_BLEND));

      await Promise.all(
        ids.map(async (adId) => {
          const rt = await getRealtimeMetrics(adId);
          if (!rt) return;
          const dImp = impressionsById.get(adId) ?? 0;
          const dClk = clicksById.get(adId) ?? 0;
          const dConv = conversionsById.get(adId) ?? 0;
          const dRev = revenueById.get(adId) ?? 0;
          // RT influence grows with volume confidence (reduces gradual coordinated drift).
          const volConfidence = 1 - Math.exp(-ADS_RT_CONFIDENCE_K * Math.max(0, dImp));
          const rtDailyW = rtMaxW * volConfidence;
          const dailyW = 1 - rtDailyW;
          // Dampen RT spikes vs daily truth (reduces cache-poison / burst manipulation).
          const capRt = (v: number, base: number) => Math.min(v, Math.max(base, 1) * 8 + 250);
          impressionsById.set(adId, dImp * dailyW + capRt(rt.impressions, dImp) * rtDailyW);
          clicksById.set(adId, dClk * dailyW + capRt(rt.clicks, dClk) * rtDailyW);
          conversionsById.set(adId, dConv * dailyW + capRt(rt.conversions, dConv) * rtDailyW);
          revenueById.set(adId, dRev * dailyW + capRt(rt.revenueCents, dRev) * rtDailyW);
        })
      );

      let totalImpressions = 0;
      let totalClicks = 0;
      for (const ad of eligible) {
        totalImpressions += impressionsById.get(ad.id) ?? 0;
        totalClicks += clicksById.get(ad.id) ?? 0;
      }

      const globalCtr = (totalClicks + SMOOTH_NUM) / (totalImpressions + SMOOTH_DEN);
      const placementMul = getPlacementMultiplier(placement);
      const contextCategory = (options?.context?.category ?? "").toUpperCase();
      const ctxKeywords = (options?.context?.keywords ?? []).map((k) => k.toLowerCase());

      function coldBlend(local: number, global: number, impressions: number): number {
        if (impressions <= 0) return global;
        const localW = Math.min(1, impressions / ADS_COLD_START_IMPRESSIONS);
        return localW * local + (1 - localW) * global;
      }

      function contextBoost(ad: (typeof eligible)[number]): number {
        let boost = 1;
        if (contextCategory && ad.targetMetric === contextCategory) boost *= 1.3;
        if (ctxKeywords.length > 0) {
          const text = `${ad.title} ${ad.description}`.toLowerCase();
          if (ctxKeywords.some((k) => text.includes(k))) boost *= 1.2;
        }
        return Math.min(ADS_CONTEXT_BOOST_MAX, boost);
      }

      /** UCB exploration term only (multiplicative blend with economic value). */
      function computeExplorationTerm(clicks: number, impressions: number, totalImp: number): number {
        const effectiveImpressions = Math.max(impressions, UCB_MIN_IMPRESSIONS);
        return Math.sqrt((2 * Math.log(totalImp + 1)) / effectiveImpressions);
      }

      ranked = [...eligible].sort((a, b) => {
        const aImp = impressionsById.get(a.id) ?? 0;
        const bImp = impressionsById.get(b.id) ?? 0;
        const aClicks = clicksById.get(a.id) ?? 0;
        const bClicks = clicksById.get(b.id) ?? 0;
        const aConv = conversionsById.get(a.id) ?? 0;
        const bConv = conversionsById.get(b.id) ?? 0;
        const aRev = revenueById.get(a.id) ?? 0;
        const bRev = revenueById.get(b.id) ?? 0;

        const aCtr = (aClicks + SMOOTH_NUM) / (aImp + SMOOTH_DEN);
        const bCtr = (bClicks + SMOOTH_NUM) / (bImp + SMOOTH_DEN);
        const aCvr =
          (aConv + ADS_PRIOR_CVR * ADS_PRIOR_CVR_WEIGHT) / (aClicks + ADS_PRIOR_CVR_WEIGHT);
        const bCvr =
          (bConv + ADS_PRIOR_CVR * ADS_PRIOR_CVR_WEIGHT) / (bClicks + ADS_PRIOR_CVR_WEIGHT);
        const aRpc = (aRev + SMOOTH_NUM) / (aClicks + SMOOTH_DEN);
        const bRpc = (bRev + SMOOTH_NUM) / (bClicks + SMOOTH_DEN);

        const aCtrAdj = coldBlend(aCtr, globalCtr, aImp);
        const bCtrAdj = coldBlend(bCtr, globalCtr, bImp);
        const aConvValue = Math.max(1, aRpc > 0 ? aRpc : ADS_DEFAULT_CONVERSION_VALUE_CENTS);
        const bConvValue = Math.max(1, bRpc > 0 ? bRpc : ADS_DEFAULT_CONVERSION_VALUE_CENTS);
        const aValue = aCtrAdj * ((a.campaign?.cpc ?? 1) * 100) + aCvr * aConvValue;
        const bValue = bCtrAdj * ((b.campaign?.cpc ?? 1) * 100) + bCvr * bConvValue;

        const aExpl = computeExplorationTerm(aClicks, aImp, Math.max(1, totalImpressions));
        const bExpl = computeExplorationTerm(bClicks, bImp, Math.max(1, totalImpressions));
        const aQuality = aValue * (1 + ADS_UCB_EXPLORATION_ALPHA * aExpl);
        const bQuality = bValue * (1 + ADS_UCB_EXPLORATION_ALPHA * bExpl);

        const aBid = a.campaign?.bidCpc ?? a.campaign?.cpc ?? 1;
        const bBid = b.campaign?.bidCpc ?? b.campaign?.cpc ?? 1;
        const aPacing = a.campaignId ? pacingByCampaignId.get(a.campaignId) ?? 1 : 1;
        const bPacing = b.campaignId ? pacingByCampaignId.get(b.campaignId) ?? 1 : 1;
        const aRank = aBid * aQuality * aPacing * placementMul * contextBoost(a);
        const bRank = bBid * bQuality * bPacing * placementMul * contextBoost(b);
        return bRank - aRank;
      });

      void redisSet(cacheKey, JSON.stringify(ranked.map((a) => a.id)), ADS_RANKED_CACHE_TTL_SECONDS);
    }
  } catch (err) {
    logger.warn("ad_ctr_rank_failed", { error: String(err) });
  }

  // Frequency cap: soft MGET → dedupe campaigns → slice → INCR only for ads actually served (post-selection).
  const capPrefix = getViewerCapPrefix(options);
  let toServeRows: (typeof eligible)[number][];

  let preChosenForLog: (typeof eligible)[number][] = [];

  if (capPrefix) {
    const keys = ranked.map((ad) => `${capPrefix}${ad.id}`);
    const currentViews = await redisMGet(keys);
    const underCap = ranked.filter((ad, i) => Number(currentViews[i] ?? 0) < ADS_FREQUENCY_CAP_PER_DAY);
    const preChosen = dedupeCampaigns(underCap).slice(0, limit);
    preChosenForLog = preChosen;
    const finalRows: (typeof eligible)[number][] = [];

    for (const ad of preChosen) {
      const key = `${capPrefix}${ad.id}`;
      const n = await redisFreqCapReserve(key, 86400, ADS_FREQUENCY_CAP_PER_DAY);
      if (n === null) {
        finalRows.push(ad);
        continue;
      }
      if (n === -1) {
        if (shouldSampleServeLog()) {
          logger.info("ads_serve_reject", {
            reason: "frequency_cap",
            adId: ad.id,
            metric,
            placement,
          });
        }
        continue;
      }
      finalRows.push(ad);
    }

    if (preChosen.length > 0 && finalRows.length === 0 && shouldSampleServeLog()) {
      logger.warn("ads_serve_freq_cap_all_rolled_back", { metric, placement, attempted: preChosen.length });
    }

    toServeRows = finalRows.length ? finalRows : [];
  } else {
    toServeRows = dedupeCampaigns(ranked).slice(0, limit);
  }

  if (shouldSampleServeLog()) {
    logger.info("ads_serve_outcome", {
      metric,
      placement,
      budgetFiltered,
      pacingFiltered,
      candidates: ads.length,
      eligible: eligible.length,
      ranked: ranked.length,
      served: toServeRows.length,
      limit,
      capPath: !!capPrefix,
      preChosen: preChosenForLog.length,
      sampleRate: ADS_SERVE_LOG_SAMPLE_RATE,
    });
  }

  const chosen = toServeRows.map((ad) => {
    const impressionId =
      options?.skipImpressionLog ? null : randomUUID();
    return {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      ctaText: ad.ctaText,
      url: ad.url,
      image: ad.image,
      targetMetric: ad.targetMetric,
      companyName: ad.campaign?.companyName ?? null,
      campaignId: ad.campaignId ?? null,
      impressionId,
      placement,
      contextSig,
      creativeId: ad.id,
    };
  });

  // Learning loop: log impressions + one-time impression proof keys. Best-effort only.
  if (!options?.skipImpressionLog) {
    void (async () => {
      await Promise.all(
        chosen.map(async (ad) => {
          if (!ad.impressionId) return;
          await prisma.analyticsEvent
            .create({
              data: {
                type: "ad_impression",
                value: 1,
                path: ad.id,
                metadata: {
                  adId: ad.id,
                  campaignId: ad.campaignId,
                  targetMetric: ad.targetMetric,
                  impressionId: ad.impressionId,
                },
              },
            })
            .catch(() => {});
          await incrRealtimeMetrics(ad.id, { impressions: 1 }).catch(() => {});
          const proofPayload = JSON.stringify({
            adId: ad.id,
            creativeId: ad.id,
            placement,
            contextHash: contextSig,
            userId: options?.userId ?? null,
            clientId: options?.clientId ?? null,
          });
          await redisSet(getImpressionProofRedisKey(ad.impressionId), proofPayload, ADS_IMPRESSION_PROOF_TTL_SECONDS).catch(
            () => false
          );
        })
      );
    })();
  }

  return chosen;
}

export type AdQualityMetrics = {
  impressions: number;
  clicks: number;
  conversions: number;
  revenueCents: number;
  ctr: number;
  cvr: number;
  rpcNorm: number; // 0..1
};

export async function getAdQualityMetrics(adId: string): Promise<AdQualityMetrics> {
  const cacheKey = `${ADS_METRICS_CACHE_PREFIX}${adId}`;
  const cached = await redisGet(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as AdQualityMetrics;
      if (
        parsed &&
        typeof parsed.impressions === "number" &&
        typeof parsed.clicks === "number" &&
        typeof parsed.conversions === "number" &&
        typeof parsed.revenueCents === "number"
      ) {
        return parsed;
      }
    } catch {
      // Ignore malformed cache.
    }
  }

  const now = new Date();
  const lookbackStart = startOfUtcDay(addUtcDays(now, -AD_METRICS_LOOKBACK_DAYS + 1));
  const recentStart = startOfUtcDay(addUtcDays(now, -AD_METRICS_RECENT_DAYS + 1));

  const rows = await prisma.adMetricsDaily.findMany({
    where: {
      adId,
      date: { gte: lookbackStart },
    },
    select: {
      date: true,
      impressions: true,
      clicks: true,
      conversions: true,
      revenueCents: true,
    },
  });

  let impressions = 0;
  let clicks = 0;
  let conversions = 0;
  let revenueCents = 0;

  for (const row of rows) {
    const weight = row.date >= recentStart ? AD_METRICS_DECAY_RECENT_WEIGHT : AD_METRICS_DECAY_OLD_WEIGHT;
    impressions += row.impressions * weight;
    clicks += row.clicks * weight;
    conversions += row.conversions * weight;
    revenueCents += row.revenueCents * weight;
  }

  const ctr = (clicks + SMOOTH_NUM) / (impressions + SMOOTH_DEN);
  const cvr = (conversions + SMOOTH_NUM) / (clicks + SMOOTH_DEN);
  const rpcCentsPerClick = (revenueCents + SMOOTH_NUM) / (clicks + SMOOTH_DEN);
  const rpcNorm = Math.min(1, rpcCentsPerClick / ADS_RPC_MAX_CENTS_PER_CLICK);

  const metrics: AdQualityMetrics = { impressions, clicks, conversions, revenueCents, ctr, cvr, rpcNorm };

  void redisSet(cacheKey, JSON.stringify(metrics), ADS_METRICS_CACHE_TTL_SECONDS);

  return metrics;
}

export function computeQualityMultiplierFromCvr(cvr: number): number {
  // Quality tiers based on Bayesian-smoothed CVR.
  if (cvr >= 0.05) return 1.0;
  if (cvr >= 0.01) return 0.6;
  return 0.2;
}

export async function getAdQualityMultiplier(adId: string, abuseScore: number): Promise<number> {
  try {
    const metrics = await getAdQualityMetrics(adId);
    let quality = computeQualityMultiplierFromCvr(metrics.cvr);

    // Abuse-aware: high abuse always reduces quality.
    if (abuseScore >= 5) quality = 0.2;
    else if (abuseScore >= 3) quality = Math.min(quality, 0.6);

    // Revenue feedback: incorporate RPC directly into bidding.
    const revenueBoost = metrics.rpcNorm > 0.7 ? 1.2 : metrics.rpcNorm > 0.3 ? 1.0 : 0.6;
    return quality * revenueBoost;
  } catch (err) {
    logger.warn("ad_quality_multiplier_failed", { error: String(err) });
    return 1.0;
  }
}

export async function getCampaignCvrSmoothed(campaignId: string): Promise<number | null> {
  const now = new Date();
  const since = startOfUtcDay(addUtcDays(now, -AD_METRICS_LOOKBACK_DAYS + 1));
  try {
    const ads = await prisma.partnerAd.findMany({
      where: {
        campaignId,
      },
      select: { id: true },
    });

    const adIds = ads.map((a) => a.id);
    if (!adIds.length) return null;

    const rows = await prisma.adMetricsDaily.findMany({
      where: {
        adId: { in: adIds },
        date: { gte: since },
      },
      select: {
        impressions: true,
        clicks: true,
        conversions: true,
      },
    });

    let clicks = 0;
    let conversions = 0;
    for (const row of rows) {
      clicks += row.clicks;
      conversions += row.conversions;
    }

    if (clicks <= 0 && conversions <= 0) return null;
    return (conversions + SMOOTH_NUM) / (clicks + SMOOTH_DEN);
  } catch (err) {
    logger.warn("campaign_cvr_smoothed_failed", { campaignId, error: String(err) });
    return null;
  }
}

export async function getCampaignPacingFactor(campaignId: string): Promise<number> {
  const cvr = await getCampaignCvrSmoothed(campaignId);
  if (cvr == null) return 1;

  const reduceBelow = Number(process.env.ADS_CAMPAIGN_CVR_REDUCE_BELOW ?? "0.01") || 0.01;
  const increaseAbove = Number(process.env.ADS_CAMPAIGN_CVR_INCREASE_ABOVE ?? "0.03") || 0.03;

  if (cvr < reduceBelow) return 0.5;
  if (cvr > increaseAbove) return 1.2;
  return 1;
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
  return registerAdClickWeighted(adId, 1);
}

/**
 * Weighted billing version:
 * - weight=1   => full CPC billing
 * - weight=0.3 => charge 30% for low-quality traffic
 * - weight=0   => do not bill, but still register the click
 */
export async function registerAdClickWeighted(adId: string, billingWeight: number): Promise<string | null> {
  // Read + write must happen in the same transaction to avoid read-before-write races.
  return prisma.$transaction(async (tx) => {
    const ad = await tx.partnerAd.findUnique({
      where: { id: adId },
      include: { campaign: true },
    });

    if (!ad || !ad.active) return null;

    // No campaign constraint: just increment clicks.
    if (!ad.campaignId || !ad.campaign) {
      await tx.partnerAd.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      });
      return ad.url;
    }

    const { campaign } = ad;

    // If weight=0 we still register the click, but we must not touch the budget.
    if (!(billingWeight > 0)) {
      await tx.partnerAd.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      });
      return ad.url;
    }

    const weightedIncrement = campaign.cpc * billingWeight;
    if (!(weightedIncrement > 0)) {
      await tx.partnerAd.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      });
      return ad.url;
    }

    // Critical: budget check + spend update must be atomic to prevent overshoot.
    const remaining = campaign.totalBudget - weightedIncrement;
    // Float-safe tolerance: budgets are stored as Float, so allow minimal rounding slack.
    const tolerance = 1e-6;

    const updatedCampaign = await tx.adCampaign.updateMany({
      where: {
        id: campaign.id,
        // Edge-case correctness: allow the last affordable click (lt -> lte).
        spent: {
          lte: remaining + tolerance,
        },
      },
      data: { spent: { increment: weightedIncrement } },
    });

    // If count is 0, budget was exceeded (or insufficient remaining).
    if (updatedCampaign.count === 0) return null;

    await tx.partnerAd.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });

    logger.info("ad_click_billed", {
      adId,
      campaignId: campaign.id,
      billingWeight,
      revenue: weightedIncrement,
    });

    return ad.url;
  });
}

/**
 * Get redirect URL for an ad without registering the click.
 * Used for deduplication (e.g. 1 redirect per minute) to prevent budget drain.
 */
export async function getAdRedirectUrl(adId: string): Promise<string | null> {
  const ad = await prisma.partnerAd.findUnique({
    where: { id: adId },
    include: { campaign: true },
  });

  if (!ad || !ad.active) return null;

  return ad.url;
}

/**
 * Lightweight lookup for click-throttling keys.
 * Returns the campaignId if the partner ad has an active campaign relation.
 */
export async function getPartnerAdCampaignId(adId: string): Promise<string | null> {
  const ad = await prisma.partnerAd.findUnique({
    where: { id: adId },
    select: { campaignId: true, campaign: { select: { active: true } } },
  });

  if (!ad?.campaignId) return null;
  if (!ad.campaign?.active) return null;
  return ad.campaignId;
}

export type PartnerAdCampaignSnapshot = {
  id: string;
  totalBudget: number;
  spent: number;
  cpc: number;
  createdAt: Date;
};

export async function getPartnerAdCampaignSnapshot(adId: string): Promise<PartnerAdCampaignSnapshot | null> {
  const ad = await prisma.partnerAd.findUnique({
    where: { id: adId },
    select: {
      campaignId: true,
      campaign: {
        select: {
          id: true,
          totalBudget: true,
          spent: true,
          cpc: true,
          createdAt: true,
          active: true,
        },
      },
    },
  });

  if (!ad?.campaignId || !ad.campaign || !ad.campaign.active) return null;

  return {
    id: ad.campaign.id,
    totalBudget: ad.campaign.totalBudget,
    spent: ad.campaign.spent,
    cpc: ad.campaign.cpc,
    createdAt: ad.campaign.createdAt,
  };
}

/**
 * Async rank-cache prewarm for hot read paths.
 * Runs without impression logging to avoid metric inflation.
 */
export async function precomputeRankedAdsCache(): Promise<void> {
  const metrics: AdTargetMetric[] = ["SEO", "PERF", "UX", "CONV"];

  for (const metric of metrics) {
    const syntheticScores =
      metric === "SEO"
        ? { seoScore: 0, perfScore: 100, uxScore: 100, convScore: 100 }
        : metric === "PERF"
          ? { seoScore: 100, perfScore: 0, uxScore: 100, convScore: 100 }
          : metric === "UX"
            ? { seoScore: 100, perfScore: 100, uxScore: 0, convScore: 100 }
            : { seoScore: 100, perfScore: 100, uxScore: 100, convScore: 0 };

    await getRelevantAds(syntheticScores, 50, {
      useRankCache: false,
      skipImpressionLog: true,
    });
  }
}

/** Alias for backwards compatibility. */
export const recordAdClick = registerAdClick;
