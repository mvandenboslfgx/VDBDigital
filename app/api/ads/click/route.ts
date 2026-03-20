import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  getAdQualityMultiplier,
  getCampaignPacingFactor,
  getAdRedirectUrl,
  getImpressionProofRedisKey,
  getPartnerAdCampaignSnapshot,
  registerAdClickWeighted,
} from "@/lib/ads";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { createSecureRoute } from "@/lib/secureRoute";
import { dedupeOnce } from "@/lib/dedupe";
import { safeRedirect } from "@/lib/safeRedirect";
import { getClientKey } from "@/lib/rateLimit";
import { redisDel, redisIncr, redisSet, redisGet } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/siteUrl";

const clickSchema = z.object({ adId: z.string().min(1).max(64) });

const ADS_CLIENT_ID_COOKIE = "ads_client_id";
const IDEMPOTENCY_TTL_SECONDS = 300; // 5 minutes
const ADS_CAMPAIGN_CLICK_MAX_PER_MINUTE = Number(process.env.ADS_CAMPAIGN_CLICK_MAX_PER_MINUTE ?? "120") || 120;
const ADS_CAMPAIGN_PACING_WINDOW_MINUTES = Number(process.env.ADS_CAMPAIGN_PACING_WINDOW_MINUTES ?? "1440") || 1440;
const ADS_CAMPAIGN_PACING_FLOOR_PER_MINUTE = Number(process.env.ADS_CAMPAIGN_PACING_FLOOR_PER_MINUTE ?? "5") || 5;
const ADS_CLICK_TOKEN_COOKIE = "ads_click_token";
const ADS_CLICK_TOKEN_TTL_SECONDS = Number(process.env.ADS_CLICK_TOKEN_TTL_SECONDS ?? "900") || 900; // 15 min
const ADS_CLICK_TOKEN_REDIS_PREFIX = "ads-click-token:";
const ADS_RT_METRICS_PREFIX = "ads:rt:";
const ADS_RT_METRICS_TTL_SECONDS = Number(process.env.ADS_RT_METRICS_TTL_SECONDS ?? "21600") || 21600;
const ADS_CLICK_COOLDOWN_SECONDS = Number(process.env.ADS_CLICK_COOLDOWN_SECONDS ?? "4") || 4;
const ADS_CLICK_GLOBAL_COOLDOWN_SECONDS = Number(process.env.ADS_CLICK_GLOBAL_COOLDOWN_SECONDS ?? "2") || 2;
const ADS_CLICK_GLOBAL_COOLDOWN_LOGGED_IN_SECONDS =
  Number(process.env.ADS_CLICK_GLOBAL_COOLDOWN_LOGGED_IN_SECONDS ?? "1") || 1;

type IdemEntry = { expiresAtMs: number; value: string };
const idempotencyMemory = new Map<string, IdemEntry>();

type WindowEntry = { count: number; resetAtMs: number };
const campaignMinuteMemory = new Map<string, WindowEntry>();

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const [k, ...v] = part.split("=");
    if (k === name) return v.join("=") ?? null;
  }
  return null;
}

function setAdsClientCookie(res: NextResponse, clientId: string): void {
  res.cookies.set(ADS_CLIENT_ID_COOKIE, clientId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

function setAdsClickTokenCookie(res: NextResponse, clickToken: string): void {
  res.cookies.set(ADS_CLICK_TOKEN_COOKIE, clickToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADS_CLICK_TOKEN_TTL_SECONDS,
  });
}

async function campaignIncrFallback(key: string, windowSeconds: number): Promise<number> {
  const now = Date.now();
  const existing = campaignMinuteMemory.get(key);
  if (!existing || now > existing.resetAtMs) {
    campaignMinuteMemory.set(key, { count: 1, resetAtMs: now + windowSeconds * 1000 });
    return 1;
  }
  existing.count += 1;
  campaignMinuteMemory.set(key, existing);
  return existing.count;
}

async function bumpRealtimeMetrics(adId: string, delta: Partial<{ clicks: number; revenueCents: number }>): Promise<void> {
  const key = `${ADS_RT_METRICS_PREFIX}${adId}`;
  const raw = await redisGet(key);
  const current = (() => {
    if (!raw) return { impressions: 0, clicks: 0, conversions: 0, revenueCents: 0 };
    try {
      const p = JSON.parse(raw) as { impressions?: number; clicks?: number; conversions?: number; revenueCents?: number };
      return {
        impressions: Number(p.impressions ?? 0),
        clicks: Number(p.clicks ?? 0),
        conversions: Number(p.conversions ?? 0),
        revenueCents: Number(p.revenueCents ?? 0),
      };
    } catch {
      return { impressions: 0, clicks: 0, conversions: 0, revenueCents: 0 };
    }
  })();

  const next = {
    impressions: current.impressions,
    clicks: current.clicks + (delta.clicks ?? 0),
    conversions: current.conversions,
    revenueCents: current.revenueCents + (delta.revenueCents ?? 0),
  };
  void redisSet(key, JSON.stringify(next), ADS_RT_METRICS_TTL_SECONDS);
}

/**
 * GET /api/ads/click?adId=xxx — register click and redirect to partner URL.
 */
export const GET = createSecureRoute<undefined>({
  auth: "optional",
  rateLimit: "sensitive",
  csrf: false,
  bodyMode: "none",
  logContext: "Ads/Click/GET",
  handler: async ({ request }) => {
    try {
      const minute = Math.floor(Date.now() / 60000);
      const hour = Math.floor(Date.now() / 3600000);
      const { searchParams } = new URL(request.url);
      const adIdRaw = searchParams.get("adId") ?? "";
      const parsed = clickSchema.safeParse({ adId: adIdRaw });
      if (!parsed.success) {
        return NextResponse.json({ error: "Missing or invalid adId" }, { status: 400 });
      }

      const adId = parsed.data.adId;
      const impressionIdRaw = searchParams.get("impressionId")?.trim() ?? "";
      const placementRaw = searchParams.get("placement")?.trim() || "sidebar";
      const contextRaw = searchParams.get("ctx")?.trim() ?? "";
      const creativeIdRaw = searchParams.get("creativeId")?.trim() || adId;

      const sessionUser = await getCurrentUser();
      const globalCooldownTtlSeconds = sessionUser
        ? ADS_CLICK_GLOBAL_COOLDOWN_LOGGED_IN_SECONDS
        : ADS_CLICK_GLOBAL_COOLDOWN_SECONDS;

      // Cookie-based identity to reduce proxy rotation attacks.
      const cookieHeader = request.headers.get("cookie") ?? null;
      let clientId = getCookieValue(cookieHeader, ADS_CLIENT_ID_COOKIE);
      let createdClientCookie = false;
      if (!clientId) {
        clientId = randomUUID();
        createdClientCookie = true;
      }

      const ip = getClientKey(request);
      const ua = request.headers.get("user-agent") ?? "";
      const accept = request.headers.get("accept") ?? "";
      const lang = request.headers.get("accept-language") ?? "";
      const fpSecret = process.env.ADS_FINGERPRINT_SECRET ?? "";

      const fingerprint = createHash("sha256")
        .update(`${clientId}|${ip}|${ua}|${accept}|${lang}|${fpSecret}`)
        .digest("hex")
        .slice(0, 24);

      // Lightweight intent validation (anti-bot).
      const secFetchSite = request.headers.get("sec-fetch-site") ?? "";
      const secFetchMode = request.headers.get("sec-fetch-mode") ?? "";
      const noSecHeaders = !secFetchSite || secFetchSite === "none" || !secFetchMode;
      const noUserAgent = !ua.trim();

      // Short burst cooldown (same fingerprint + ad).
      const cooldownKey = `ads:click-cd:${fingerprint}:${adId}`;
      const onClickCooldown = !!(await redisGet(cooldownKey));

      // Global throttle: same fingerprint across any ad (anti rotation A→B→C).
      const globalCooldownKey = `ads:click-cd-global:${fingerprint}`;
      const onGlobalCooldown = !!(await redisGet(globalCooldownKey));

      // One-time impression → click binding (consume key); placement + context must match serve.
      let missingImpressionProof = true;
      if (impressionIdRaw && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(impressionIdRaw)) {
        const proofKey = getImpressionProofRedisKey(impressionIdRaw);
        const rawProof = await redisGet(proofKey);
        if (rawProof) {
          try {
            const p = JSON.parse(rawProof) as {
              adId: string;
              creativeId?: string | null;
              placement?: string;
              contextHash?: string;
              userId?: string | null;
              clientId?: string | null;
            };
            if (p.adId === adId) {
              let ok = true;
              if (p.placement != null && p.placement !== placementRaw) ok = false;
              if (ok && p.contextHash != null && p.contextHash !== contextRaw) ok = false;
              if (ok && p.creativeId != null && p.creativeId !== creativeIdRaw) ok = false;
              if (p.userId) {
                if (!sessionUser || sessionUser.id !== p.userId) ok = false;
              }
              if (ok && p.clientId && p.clientId !== clientId) ok = false;
              if (ok) {
                missingImpressionProof = false;
                void redisDel(proofKey);
              }
            }
          } catch {
            missingImpressionProof = true;
          }
        }
      }

      // Idempotency/cached redirect result.
      const idempotencyKey = `ads-click-idem:${fingerprint}:${adId}:${minute}`;
      const mem = idempotencyMemory.get(idempotencyKey);
      if (mem && mem.expiresAtMs > Date.now()) {
        if (!mem.value) {
          const fallbackRes = NextResponse.redirect(new URL("/", getBaseUrl()), 302);
          fallbackRes.headers.set("Cache-Control", "no-store");
          if (createdClientCookie) setAdsClientCookie(fallbackRes, clientId);
          return fallbackRes;
        }
        const res = safeRedirect(mem.value);
        if (createdClientCookie) setAdsClientCookie(res, clientId);
        return res;
      }

      const cached = await redisGet(idempotencyKey);
      if (cached !== null) {
        if (!cached) {
          const fallbackRes = NextResponse.redirect(new URL("/", getBaseUrl()), 302);
          fallbackRes.headers.set("Cache-Control", "no-store");
          if (createdClientCookie) setAdsClientCookie(fallbackRes, clientId);
          return fallbackRes;
        }

        const res = safeRedirect(cached);
        if (createdClientCookie) setAdsClientCookie(res, clientId);
        idempotencyMemory.set(idempotencyKey, {
          expiresAtMs: Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000,
          value: cached,
        });
        return res;
      }

      // Hour/minute dedupe.
      const minuteKey = `ads-click:${fingerprint}:${adId}:${minute}`;
      const minuteOk = await dedupeOnce(minuteKey, 60);

      const hourKey = `ads-click-hour:${fingerprint}:${adId}:${hour}`;
      const hourOk = await dedupeOnce(hourKey, 3600);

      // Campaign-level throttle across distributed IPs.
      const campaignSnapshot = await getPartnerAdCampaignSnapshot(adId);
      let campaignOk = true;
      let dynamicLimit = ADS_CAMPAIGN_CLICK_MAX_PER_MINUTE;
      if (campaignSnapshot) {
        const now = Date.now();
        const remainingBudget = Math.max(0, campaignSnapshot.totalBudget - campaignSnapshot.spent);
        const endsAtMs = campaignSnapshot.createdAt.getTime() + ADS_CAMPAIGN_PACING_WINDOW_MINUTES * 60 * 1000;
        const remainingMinutes = Math.max(1, Math.floor((endsAtMs - now) / 60000));
        const pacingFactor = await getCampaignPacingFactor(campaignSnapshot.id);

        if (remainingBudget <= 0 || campaignSnapshot.cpc <= 0) {
          dynamicLimit = 0;
        } else {
          // Remaining budget spread evenly across time left -> clicks/min cap.
          const baseLimit = Math.max(
            ADS_CAMPAIGN_PACING_FLOOR_PER_MINUTE,
            Math.floor(remainingBudget / (campaignSnapshot.cpc * remainingMinutes))
          );
          const pacingFloor = Math.max(1, Math.floor(ADS_CAMPAIGN_PACING_FLOOR_PER_MINUTE * pacingFactor));
          dynamicLimit = Math.floor(baseLimit * pacingFactor);
          dynamicLimit = Math.max(pacingFloor, dynamicLimit);

          // Endgame mode: when only a short time is left, burn remaining budget faster.
          // (Fail-safe: keep a conservative cap to avoid runaway spend.)
          if (remainingMinutes < 60) {
            const cap = ADS_CAMPAIGN_CLICK_MAX_PER_MINUTE * 2;
            dynamicLimit = Math.min(cap, Math.floor(dynamicLimit * 2));
          }
        }

        const campaignMinuteKey = `campaign-clicks:${campaignSnapshot.id}:${minute}`;
        const count = await (async () => {
          const incr = await redisIncr(campaignMinuteKey, 60);
          if (incr === null) return campaignIncrFallback(campaignMinuteKey, 60);
          return incr;
        })();

        campaignOk = dynamicLimit > 0 && count <= dynamicLimit;
      }

      // Abuse score engine: skip billing when suspicious.
      let score = 0;
      if (!minuteOk) score += 2;
      if (!hourOk) score += 3;
      if (noSecHeaders) score += 2;
      if (noUserAgent) score += 3;
      if (missingImpressionProof) score += 3;
      if (!campaignOk) score += 2;
      if (onClickCooldown) score += 4;
      if (onGlobalCooldown) score += 3;

      // Click weighting: charge less for suspicious traffic, 0 for high suspicion.
      let billingWeight = 1;
      if (noSecHeaders || score >= 5) billingWeight = 0;
      else if (score >= 3) billingWeight = 0.3;

      // Smart bidding: adapt spend quality to conversion performance (abuse-aware).
      const qualityMultiplier = await getAdQualityMultiplier(adId, score);
      billingWeight = billingWeight * qualityMultiplier;

      // Velocity anomaly guard: rapid spikes disable billing to protect budget.
      const velocityKey = `ads-velocity:${adId}:${minute}`;
      const velocity = await redisIncr(velocityKey, 60);
      const velocityLimit = Number(process.env.ADS_CLICK_VELOCITY_LIMIT_PER_MINUTE ?? "50") || 50;
      if (velocity !== null && velocity > velocityLimit) {
        billingWeight = 0;
      }

      // Campaign throttle always shields budget.
      if (!campaignOk) billingWeight = 0;

      const shouldRegisterClicks = minuteOk && hourOk && !onClickCooldown && !onGlobalCooldown;
      const billingWeightEffective = shouldRegisterClicks ? billingWeight : 0;

      const urlFromRegister = shouldRegisterClicks
        ? await registerAdClickWeighted(adId, billingWeightEffective)
        : null;
      const url = urlFromRegister ?? (await getAdRedirectUrl(adId));

      let clickTokenToIssue: string | null = null;
      if (shouldRegisterClicks && urlFromRegister && billingWeightEffective > 0) {
        clickTokenToIssue = randomUUID();
        void redisSet(
          `${ADS_CLICK_TOKEN_REDIS_PREFIX}${clickTokenToIssue}`,
          JSON.stringify({
            adId,
            campaignId: campaignSnapshot?.id ?? null,
            clientId,
            abuseScore: score,
            issuedAtMs: Date.now(),
          }),
          ADS_CLICK_TOKEN_TTL_SECONDS
        );
      }

      // Learning loop: log clicks only if we actually registered the click (avoid double counts).
      if (shouldRegisterClicks && urlFromRegister) {
        const revenueCents = Math.max(
          0,
          Math.round((campaignSnapshot?.cpc ?? 0) * 100 * Math.max(0, billingWeightEffective))
        );
        void prisma.analyticsEvent
          .create({
            data: {
              type: "ad_click",
              value: 1,
              path: adId,
              metadata: {
                adId,
                campaignId: campaignSnapshot?.id ?? null,
                score,
                billingWeight: billingWeightEffective,
                billed: billingWeightEffective > 0,
              },
            },
          })
          .catch(() => {});
        void bumpRealtimeMetrics(adId, { clicks: 1, revenueCents });
      }

      if (!url) {
        const idemValue = "";
        idempotencyMemory.set(idempotencyKey, {
          expiresAtMs: Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000,
          value: idemValue,
        });
        void redisSet(idempotencyKey, idemValue, IDEMPOTENCY_TTL_SECONDS);

        const fallbackRes = NextResponse.redirect(new URL("/", getBaseUrl()), 302);
        fallbackRes.headers.set("Cache-Control", "no-store");
        if (createdClientCookie) setAdsClientCookie(fallbackRes, clientId);
        return fallbackRes;
      }

      idempotencyMemory.set(idempotencyKey, {
        expiresAtMs: Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000,
        value: url,
      });
      void redisSet(idempotencyKey, url, IDEMPOTENCY_TTL_SECONDS);

      if (url) {
        void redisSet(cooldownKey, "1", ADS_CLICK_COOLDOWN_SECONDS);
        void redisSet(globalCooldownKey, "1", globalCooldownTtlSeconds);
      }

      const res = safeRedirect(url);
      if (createdClientCookie) setAdsClientCookie(res, clientId);
      if (clickTokenToIssue) setAdsClickTokenCookie(res, clickTokenToIssue);
      return res;
    } catch {
      return NextResponse.json({ error: "Unable to register click." }, { status: 500 });
    }
  },
});
