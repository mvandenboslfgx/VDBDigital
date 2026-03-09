import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";
import { getAllAdCampaigns } from "@/lib/ads";

const createCampaignSchema = z.object({
  companyName: z.string().min(1).max(200),
  totalBudget: z.number().positive(),
  cpc: z.number().positive(),
});

/** GET /api/admin/ads/campaigns — list all campaigns (admin/owner) */
export async function GET() {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    const campaigns = await getAllAdCampaigns();
    return NextResponse.json(campaigns);
  } catch (e) {
    return handleApiError(e, "AdminCampaignsList");
  }
}

/** POST /api/admin/ads/campaigns — create campaign (admin/owner) */
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
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Validatiefout";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const campaign = await prisma.adCampaign.create({
      data: {
        companyName: parsed.data.companyName,
        totalBudget: parsed.data.totalBudget,
        spent: 0,
        cpc: parsed.data.cpc,
        active: true,
      },
    });
    return NextResponse.json(campaign);
  } catch (e) {
    return handleApiError(e, "AdminCampaignsCreate");
  }
}
