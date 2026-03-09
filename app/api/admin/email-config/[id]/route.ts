import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { z } from "zod";

const idParam = z.string().min(1).max(64);

/** DELETE /api/admin/email-config/[id] — delete (admin/owner, CSRF, rate limit) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);

    const { id } = await params;
    const parsed = idParam.safeParse(id);
    if (!parsed.success) return safeJsonError("Ongeldige id", 400);

    const key = `admin:email-config-delete:${getClientKey(_request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) return safeJsonError("Te veel aanvragen.", 429);

    if (!(await validateCsrf(_request))) return safeJsonError("Ongeldige aanvraag", 403);

    await prisma.siteEmailConfig.delete({ where: { id: parsed.data } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleApiError(e, "AdminEmailConfigDelete");
  }
}
