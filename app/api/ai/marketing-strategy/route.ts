import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canUseAiTools } from "@/lib/features";
import { generateMarketingStrategy } from "@/modules/ai/marketingStrategy";
import { prisma } from "@/lib/prisma";
import { validateOrigin, sanitizeString } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
    }
    const key = `ai:marketing:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Too many requests. Try again later.", 429);
    }

    const user = await getCurrentUser();
    const dbUser = user
      ? await prisma.user.findUnique({
          where: { id: user.id },
          include: { plan: true },
        })
      : null;
    if (!dbUser || !canUseAiTools(dbUser)) {
      return NextResponse.json(
        { message: "Upgrade your plan to use AI tools." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { businessDescription?: string };
    const businessDescription = sanitizeString(body.businessDescription ?? "", 3000);
    if (!businessDescription.trim()) {
      return NextResponse.json(
        { message: "Business description is required." },
        { status: 400 }
      );
    }

    const result = await generateMarketingStrategy(businessDescription, dbUser.id);
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    logger.error("[AI/MarketingStrategy]", { error: String(error) });
    return handleApiError(error, "AI/MarketingStrategy");
  }
}
