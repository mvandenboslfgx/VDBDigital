import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { isBodyOverLimit, MAX_BODY_BYTES_DEFAULT } from "@/lib/requestSafety";
import { validateEmailFormat } from "@/lib/apiSecurity";
import { z } from "zod";

const createSchema = z.object({
  sourceEmail: z.string().min(1).max(254).refine(validateEmailFormat, "Ongeldig e-mailadres"),
  targetEmail: z.string().min(1).max(254).refine(validateEmailFormat, "Ongeldig doel e-mailadres"),
});

/** GET /api/admin/email-config — list all (admin/owner only) */
export async function GET() {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);

    const list = await prisma.siteEmailConfig.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, sourceEmail: true, targetEmail: true, createdAt: true },
    });
    return NextResponse.json(list);
  } catch (e) {
    return handleApiError(e, "AdminEmailConfigList");
  }
}

/** POST /api/admin/email-config — add (admin/owner, CSRF, rate limit, validation) */
export async function POST(request: Request) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    if (!(await validateCsrf(request))) return safeJsonError("Ongeldige aanvraag", 403);

    const key = `admin:email-config:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) return safeJsonError("Te veel aanvragen.", 429);

    if (isBodyOverLimit(request, MAX_BODY_BYTES_DEFAULT, true)) {
      return safeJsonError("Verzoek te groot.", 413);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return safeJsonError("Ongeldige JSON", 400);
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Validatiefout";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { sourceEmail, targetEmail } = parsed.data;
    const normalizedSource = sourceEmail.trim().toLowerCase();
    const normalizedTarget = targetEmail.trim().toLowerCase();

    const existing = await prisma.siteEmailConfig.findFirst({
      where: { sourceEmail: normalizedSource },
    });
    if (existing) {
      return safeJsonError("Dit bron-e-mailadres bestaat al.", 409);
    }

    const created = await prisma.siteEmailConfig.create({
      data: { sourceEmail: normalizedSource, targetEmail: normalizedTarget },
      select: { id: true, sourceEmail: true, targetEmail: true, createdAt: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e, "AdminEmailConfigCreate");
  }
}
