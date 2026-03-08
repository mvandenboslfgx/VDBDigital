import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canUseAiTools } from "@/lib/features";
import { generateLandingPage } from "@/modules/ai/landingPage";
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
    const key = `ai:landing:${getClientKey(request)}`;
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

    const body = (await request.json().catch(() => ({}))) as {
      productOrTopic?: string;
      targetAudience?: string;
    };
    const productOrTopic = sanitizeString(body.productOrTopic ?? "", 500);
    const targetAudience = sanitizeString(body.targetAudience ?? "", 200);
    if (!productOrTopic.trim()) {
      return NextResponse.json(
        { message: "Product or topic is required." },
        { status: 400 }
      );
    }

    const result = await generateLandingPage(
      { productOrTopic, targetAudience: targetAudience || undefined },
      dbUser.id
    );
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    logger.error("[AI/LandingPage]", { error: String(error) });
    return handleApiError(error, "AI/LandingPage");
  }
}
