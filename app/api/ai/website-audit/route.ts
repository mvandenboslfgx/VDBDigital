import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runFullWebsiteAudit, computeLeadScore } from "@/lib/ai-website-audit";
import { captureAuditLead } from "@/modules/leads/auditLead";
import { addAuditJob, isAuditQueueAvailable } from "@/modules/audit/queue";
import { validateOrigin, sanitizeString, sanitizeEmail, sanitizeWebsiteUrl, validateEmailFormat, containsPromptInjection } from "@/lib/apiSecurity";
import { rateLimitAi, rateLimitAuditPerHour, getClientKey } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { handleApiError } from "@/lib/apiSafeResponse";
import { getCurrentUser } from "@/lib/auth";
import {
  getMonthlyAuditLimit,
  getAndEnsureCurrentMonthCount,
} from "@/lib/audit-limits";
import { sendAuditReportEmail } from "@/lib/email";
import { websiteAuditBodySchema, safeParse } from "@/lib/validation";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { success: false, message: "Ongeldige aanvraag." },
        { status: 403 }
      );
    }
    const clientKey = getClientKey(request);
    const key = `ai:audit:${clientKey}`;
    const { ok: okMinute } = rateLimitAi(key);
    if (!okMinute) {
      return NextResponse.json(
        { success: false, message: "Te veel aanvragen. Probeer het over een minuut opnieuw." },
        { status: 429 }
      );
    }
    const { ok: okHour } = rateLimitAuditPerHour(`audit-hour:${clientKey}`);
    if (!okHour) {
      return NextResponse.json(
        { success: false, message: "U heeft het maximum van 10 scans per uur bereikt. Probeer het later opnieuw." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Ongeldige JSON-body." },
        { status: 400 }
      );
    }
    const parsed = safeParse(websiteAuditBodySchema, body);
    if (!parsed.success) {
      const first = parsed.error.issues?.[0];
      const msg = first?.message ?? "Ongeldige invoer.";
      return NextResponse.json(
        { success: false, message: msg },
        { status: 400 }
      );
    }
    const { url: rawUrl, email: rawEmail, name: rawName, company: rawCompany, preview, useQueue } = parsed.data;

    if (containsPromptInjection(rawUrl)) {
      logger.warn("[Security] Prompt injection attempt in audit URL", { key: getClientKey(request).slice(0, 30) });
      return NextResponse.json(
        { success: false, message: "Vul een geldige website-URL in." },
        { status: 400 }
      );
    }
    const url = sanitizeWebsiteUrl(rawUrl.trim(), 500);
    if (!url) {
      return NextResponse.json(
        { success: false, message: "Vul een geldige website-URL in." },
        { status: 400 }
      );
    }

    const email = rawEmail ? sanitizeEmail(rawEmail) : "";
    const name = rawName ? sanitizeString(rawName, 120) : "";
    const company = rawCompany ? sanitizeString(rawCompany, 120) : "";

    if (!preview && !email) {
      return NextResponse.json(
        { success: false, message: "Email is required to unlock the full report." },
        { status: 400 }
      );
    }
    if (!preview && !validateEmailFormat(email)) {
      return NextResponse.json(
        { success: false, message: "Vul een geldig e-mailadres in." },
        { status: 400 }
      );
    }

    const fullReport = !preview && !!email;
    const user = await getCurrentUser();
    if (fullReport && user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { plan: true },
      });
      const planName = dbUser?.plan?.name ?? null;
      const limit = getMonthlyAuditLimit(planName);
      if (limit !== null) {
        const count = await getAndEnsureCurrentMonthCount(user.id);
        if (count >= limit) {
          return NextResponse.json(
            {
              success: false,
              message: `Je hebt je maandelijkse auditlimiet bereikt (${limit}). Upgrade je plan voor meer.`,
            },
            { status: 429 }
          );
        }
      }
    }

    const useQueueFlag = fullReport && useQueue === true && isAuditQueueAvailable();
    if (useQueueFlag) {
      const jobId = await addAuditJob({
        url,
        email,
        name: name || undefined,
        company: company || undefined,
        userId: user?.id,
      });
      if (jobId) {
        trackEvent("audit_started", { jobId, useQueue: true });
        return NextResponse.json(
          {
            success: true,
            jobId,
            message: "Scan gestart. Gebruik de status-API om de voortgang te volgen.",
            statusUrl: `/api/ai/website-audit/status?jobId=${jobId}`,
          },
          { status: 200 }
        );
      }
    }

    trackEvent("audit_started", { url: url.slice(0, 50) });
    const result = await runFullWebsiteAudit(url, fullReport);
    trackEvent("audit_completed", {
      url: url.slice(0, 50),
      score: Math.round(
        (result.scores.seoScore + result.scores.perfScore + result.scores.uxScore + result.scores.convScore) / 4
      ),
    });
    const leadScoreValue = computeLeadScore(result.scores);

    if (fullReport) {
      try {
        await captureAuditLead(
          {
            email,
            name: name || undefined,
            company: company || undefined,
            website: url,
          },
          result,
          user?.id
        );
        sendAuditReportEmail({
          to: email,
          website: result.signals.url,
          summary: result.summary,
          seoScore: result.scores.seoScore,
          perfScore: result.scores.perfScore,
          uxScore: result.scores.uxScore,
          convScore: result.scores.convScore,
        }).catch(() => {});
      } catch (e) {
        logger.error("[AI/WebsiteAudit] Lead/Report save failed", { error: String(e) });
        return NextResponse.json(
          { success: false, message: "Could not save your report. Please try again." },
          { status: 500 }
        );
      }
    }

    const scores = result.scores;
    const overallScore =
      result.totalScore ??
      Math.round(
        (scores.seoScore + scores.perfScore + scores.uxScore + scores.convScore) / 4
      );

    try {
      const domain = (() => {
        try {
          return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
        } catch {
          return url.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
        }
      })();
      if (domain && domain.length >= 2) {
        const publicResult = JSON.parse(
          JSON.stringify({
            scores: result.scores,
            summary: result.summary,
            summaryShort: result.summaryShort,
            signals: { url: result.signals.url, title: result.signals.title },
          })
        );
        await prisma.publicAudit.upsert({
          where: { domain },
          create: { domain, score: overallScore, result: publicResult },
          update: { score: overallScore, result: publicResult },
        });
      }
    } catch (e) {
      logger.warn("[AI/WebsiteAudit] PublicAudit upsert failed", { error: String(e) });
    }

    const defaultRecommendations = [
      "Verbeter je call-to-action",
      "Optimaliseer laadsnelheid",
      "Voeg duidelijke waardepropositie toe",
    ];
    const recommendationsList =
      result.recommendations?.length
        ? result.recommendations
        : result.summaryShort && result.summaryShort.trim().length > 0
          ? [result.summaryShort]
          : defaultRecommendations;
    return NextResponse.json(
      {
        success: true,
        score: overallScore,
        totalScore: result.totalScore ?? overallScore,
        scores,
        issues: result.issues ?? [],
        recommendations: recommendationsList,
        insights: result.summary && result.summary.trim().length > 0 ? result.summary : "Basis analyse uitgevoerd.",
        url: result.signals.url,
        signals: result.signals,
        summary: result.summary,
        summaryShort: result.summaryShort,
        scanConfidence: result.scanConfidence,
        confidence: result.confidence,
        technicalSummary: result.technicalSummary,
        leadScore: fullReport ? leadScoreValue : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "AI/WebsiteAudit");
  }
}
