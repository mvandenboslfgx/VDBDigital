import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const updateAdSchema = z.object({
  active: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  ctaText: z.string().max(100).optional(),
  url: z.string().url().max(500).optional(),
  image: z.string().url().optional().nullable(),
  targetMetric: z.enum(["SEO", "PERF", "UX", "CONV"]).optional(),
});

/** PATCH /api/admin/ads/[id] — toggle active or update ad (admin/owner) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    if (!(await validateCsrf(request))) return safeJsonError("Invalid request", 403);

    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return safeJsonError("Invalid JSON", 400);
    }
    const parsed = updateAdSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validatiefout" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const ad = await prisma.partnerAd.update({
      where: { id },
      data: {
        ...(typeof data.active === "boolean" && { active: data.active }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.ctaText !== undefined && { ctaText: data.ctaText }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.targetMetric !== undefined && { targetMetric: data.targetMetric }),
      },
    });
    return NextResponse.json(ad);
  } catch (e) {
    return handleApiError(e, "AdminAdsUpdate");
  }
}
