import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";
import { getAllPartnerAds } from "@/lib/ads";

const createAdSchema = z.object({
  title: z.string().min(1, "Titel verplicht").max(200),
  description: z.string().min(1).max(2000),
  ctaText: z.string().max(100).default("Bekijk aanbieding"),
  url: z.string().url("Ongeldige URL").max(500),
  image: z.string().url().optional().or(z.literal("")),
  targetMetric: z.enum(["SEO", "PERF", "UX", "CONV"]),
  campaignId: z.string().optional(),
});

/** GET /api/admin/ads — list all partner ads (admin/owner) */
export async function GET() {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    const ads = await getAllPartnerAds();
    return NextResponse.json(ads);
  } catch (e) {
    return handleApiError(e, "AdminAdsList");
  }
}

/** POST /api/admin/ads — create partner ad (admin/owner) */
export async function POST(request: Request) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    if (!(await validateCsrf(request))) return safeJsonError("Invalid request", 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return safeJsonError("Invalid JSON", 400);
    }
    const parsed = createAdSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Validatiefout";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const data = parsed.data;
    const ad = await prisma.partnerAd.create({
      data: {
        title: data.title,
        description: data.description,
        ctaText: data.ctaText || "Bekijk aanbieding",
        url: data.url,
        image: data.image?.trim() || null,
        targetMetric: data.targetMetric,
        campaignId: data.campaignId || null,
        active: true,
      },
    });
    return NextResponse.json(ad);
  } catch (e) {
    return handleApiError(e, "AdminAdsCreate");
  }
}
