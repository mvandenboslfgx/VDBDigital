import { NextResponse } from "next/server";
import { z } from "zod";
import { createSecureRoute } from "@/lib/secureRoute";
import { redisGet, redisIncr, redisSet } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const ADS_CLICK_TOKEN_COOKIE = "ads_click_token";
const ADS_CLIENT_ID_COOKIE = "ads_client_id";
const ADS_CLICK_TOKEN_REDIS_PREFIX = "ads-click-token:";

const ADS_CONVERSION_ONCE_PREFIX = "ads-conv-once:";
const ADS_CONVERSION_ONCE_TTL_SECONDS = 60 * 60 * 24; // 24h
const ADS_RT_METRICS_PREFIX = "ads:rt:";
const ADS_RT_METRICS_TTL_SECONDS = Number(process.env.ADS_RT_METRICS_TTL_SECONDS ?? "21600") || 21600;

// Fallback idempotency when Redis is down.
type ConversionOnceEntry = { expiresAtMs: number };
const conversionOnceMemory = new Map<string, ConversionOnceEntry>();
type ClickTokenData = {
  adId: string;
  campaignId: string | null;
  clientId: string;
  issuedAtMs: number;
  abuseScore?: number;
};

function isValidMoneyString(value: string): boolean {
  const [whole, decimals] = value.split(".");
  if (!whole || !/^\d+$/.test(whole)) return false;
  if (decimals === undefined) return true;
  return /^\d{1,2}$/.test(decimals);
}

const conversionBodySchema = z
  .object({
    adId: z.string().min(1).max(64),
    campaignId: z.string().min(1).max(64).optional().nullable(),
    // Amount in euros. We convert to integer cents server-side.
    value: z.union([
      z.number().nonnegative().max(100000),
      z
        .string()
        .refine(isValidMoneyString, "Invalid amount format")
        .transform((s) => s),
    ]),
  })
  .strict();

function parseEuroToCents(value: number | string): number {
  if (typeof value === "number") {
    // Avoid float surprises by rounding to 2 decimals first.
    return Math.round(value * 100);
  }
  const [intPart, fracPartRaw] = value.split(".");
  const fracPart = (fracPartRaw ?? "").padEnd(2, "0").slice(0, 2);
  const cents = Number(intPart) * 100 + Number(fracPart);
  return Math.max(0, cents);
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const [k, ...v] = part.split("=");
    if (k === name) return v.join("=") ?? null;
  }
  return null;
}

function parseClickTokenData(raw: string): ClickTokenData | null {
  try {
    const parsed = JSON.parse(raw) as ClickTokenData;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.adId !== "string") return null;
    if (parsed.campaignId !== null && typeof parsed.campaignId !== "string") return null;
    if (typeof parsed.clientId !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function isTokenBoundToRequest(tokenData: ClickTokenData, clientId: string, adId: string, campaignId?: string | null): boolean {
  if (tokenData.clientId !== clientId) return false;
  if (tokenData.adId !== adId) return false;
  if (campaignId && tokenData.campaignId && campaignId !== tokenData.campaignId) return false;
  return true;
}

async function bumpRealtimeMetrics(adId: string, delta: Partial<{ conversions: number; revenueCents: number }>): Promise<void> {
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
    clicks: current.clicks,
    conversions: current.conversions + (delta.conversions ?? 0),
    revenueCents: current.revenueCents + (delta.revenueCents ?? 0),
  };
  void redisSet(key, JSON.stringify(next), ADS_RT_METRICS_TTL_SECONDS);
}

async function claimConversionOnce(onceKey: string): Promise<"new" | "duplicate"> {
  const incr = await redisIncr(onceKey, ADS_CONVERSION_ONCE_TTL_SECONDS);
  if (incr === null) {
    const existing = conversionOnceMemory.get(onceKey);
    if (existing && existing.expiresAtMs > Date.now()) {
      return "duplicate";
    }
    conversionOnceMemory.set(onceKey, {
      expiresAtMs: Date.now() + ADS_CONVERSION_ONCE_TTL_SECONDS * 1000,
    });
    return "new";
  }
  if (incr > 1) return "duplicate";
  return "new";
}

export const POST = createSecureRoute<z.infer<typeof conversionBodySchema>, undefined>({
  auth: "required",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "json",
  schema: conversionBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  logContext: "Ads/Conversion/POST",
  handler: async ({ input, user, request }) => {
    const cookieHeader = request.headers.get("cookie") ?? null;
    const clickToken = getCookieValue(cookieHeader, ADS_CLICK_TOKEN_COOKIE);
    const clientId = getCookieValue(cookieHeader, ADS_CLIENT_ID_COOKIE);

    if (!clickToken || !clientId) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const tokenRaw = await redisGet(`${ADS_CLICK_TOKEN_REDIS_PREFIX}${clickToken}`);
    if (!tokenRaw) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const tokenData = parseClickTokenData(tokenRaw);
    if (!tokenData) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    if (!isTokenBoundToRequest(tokenData, clientId, input.adId, input.campaignId)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const resolvedCampaignId = tokenData.campaignId ?? input.campaignId ?? null;
    if (input.campaignId && tokenData.campaignId && input.campaignId !== tokenData.campaignId) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const valueCents = parseEuroToCents(input.value);
    if (valueCents <= 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Conversion trust score (server-side):
    // - click validation token binds the conversion to a real rewarded click
    // - abuseScore reduces revenue contribution for suspicious events
    let conversionQuality = 1.0;
    if (typeof tokenData.abuseScore === "number") {
      if (tokenData.abuseScore >= 5) conversionQuality = 0.2;
      else if (tokenData.abuseScore >= 3) conversionQuality = 0.6;
    }

    const adjustedValueCents = Math.max(1, Math.round(valueCents * conversionQuality));

    // Idempotency: only one conversion per click token.
    const onceKey = `${ADS_CONVERSION_ONCE_PREFIX}${clickToken}`;
    const idempotency = await claimConversionOnce(onceKey);
    if (idempotency === "duplicate") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await prisma.analyticsEvent.create({
      data: {
        type: "ad_conversion",
        value: adjustedValueCents,
        path: input.adId,
        userId: user!.id,
        metadata: {
          adId: input.adId,
          campaignId: resolvedCampaignId,
          clickToken,
          conversionQuality,
          rawValueCents: valueCents,
        },
      },
    });
    void bumpRealtimeMetrics(input.adId, { conversions: 1, revenueCents: adjustedValueCents });

    return NextResponse.json({ ok: true }, { status: 200 });
  },
});

