import { NextResponse } from "next/server";
import {
  runWebsiteAudit,
  storeAuditResult,
} from "@/modules/ai-audit/logic";
import { createLead } from "@/modules/crm/logic";
import type { AuditRequestPayload } from "@/modules/ai-audit/types";
import { getCurrentUser } from "@/lib/auth";
import { recordAIUsage } from "@/lib/ai/usage";
import { validateOrigin, sanitizeWebsiteUrl, validateEmailFormat } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return safeJsonError("Ongeldige aanvraag.", 403);
    }
    const key = `ai:audit:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const body = (await request.json()) as AuditRequestPayload;
    const rawUrl = (body.url ?? "").trim();
    const url = sanitizeWebsiteUrl(rawUrl, 500);
    const email = (body.email ?? "").trim().toLowerCase();

    if (!url) {
      return NextResponse.json(
        { message: "Voer een geldige URL in." },
        { status: 400 }
      );
    }
    if (email && !validateEmailFormat(email)) {
      return NextResponse.json(
        { message: "Voer een geldig e-mailadres in." },
        { status: 400 }
      );
    }

    const result = await runWebsiteAudit(url);

    const user = await getCurrentUser();
    void recordAIUsage({
      userId: user?.id,
      tool: "audit",
      creditsUsed: 1,
    });

    if (email) {
      try {
        const lead = await createLead({
          name: `AI Audit · ${url}`,
          email,
          company: undefined,
          message: `AI website audit aangevraagd voor ${url}.`,
          website: url,
          source: "audit",
        });
        await storeAuditResult(lead.id, url, result);
      } catch {
        // lead/audit storage failures should not block audit response
      }
    }

    return NextResponse.json(
      {
        url,
        result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error, "AI/Audit");
  }
}

