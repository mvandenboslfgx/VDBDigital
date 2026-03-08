import { NextResponse } from "next/server";
import { validateOrigin, sanitizeWebsiteUrl } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";

export const runtime = "nodejs";

function parsePageSpeed(json: {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } };
    audits?: Record<
      string,
      { numericValue?: number; displayValue?: string; description?: string }
    >;
  };
  loadingExperience?: {
    metrics?: Record<
      string,
      { percentile?: number; category?: string }
    >;
  };
}) {
  const audits = json.lighthouseResult?.audits ?? {};
  const lcp = audits["largest-contentful-paint"];
  const cls = audits["cumulative-layout-shift"];
  const fid = audits["first-input-delay"] ?? audits["interaction-to-next-paint"];
  const fcp = audits["first-contentful-paint"];
  const tbt = audits["total-blocking-time"];
  const score = json.lighthouseResult?.categories?.performance?.score;
  const tips: string[] = [];
  if (lcp?.numericValue && lcp.numericValue > 2500) {
    tips.push("LCP te hoog: optimaliseer afbeeldingen en critical rendering path.");
  }
  if (cls?.numericValue && cls.numericValue > 0.1) {
    tips.push("CLS: reserveer ruimte voor afbeeldingen en dynamische content.");
  }
  if (fid?.numericValue && fid.numericValue > 200) {
    tips.push("INP/FID: verminder JavaScript op de main thread.");
  }
  if (!tips.length) tips.push("Core Web Vitals zien er goed uit. Houd monitoring aan.");
  return {
    score: score != null ? Math.round(score * 100) : null,
    lcp: lcp ? { value: lcp.numericValue, display: lcp.displayValue } : null,
    cls: cls ? { value: cls.numericValue, display: cls.displayValue } : null,
    fid: fid ? { value: fid.numericValue, display: fid.displayValue } : null,
    fcp: fcp ? { display: fcp.displayValue } : null,
    tbt: tbt ? { display: tbt.displayValue } : null,
    tips,
  };
}

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
    }
    const key = `ai:perf:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const rawUrl = (body.url ?? "").trim();
    const url = sanitizeWebsiteUrl(rawUrl, 500);
    if (!url) {
      return NextResponse.json(
        { message: "Vul een geldige website-URL in." },
        { status: 400 }
      );
    }

    const apiKey = process.env.PAGESPEED_API_KEY?.trim();
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance${keyParam}`,
      { signal: AbortSignal.timeout(30000), next: { revalidate: 0 } }
    );
    if (!res.ok) {
      return NextResponse.json(
        { message: "PageSpeed API niet beschikbaar. Probeer het later opnieuw." },
        { status: 502 }
      );
    }
    const data = (await res.json()) as Parameters<typeof parsePageSpeed>[0];
    const result = parsePageSpeed(data);
    return NextResponse.json({
      success: true,
      url,
      ...result,
    });
  } catch (error) {
    return handleApiError(error, "AI/PerformanceCheck");
  }
}
