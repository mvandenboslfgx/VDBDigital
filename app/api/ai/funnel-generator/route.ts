import { NextResponse } from "next/server";
import { generateFunnel } from "@/modules/funnel-generator/logic";
import type { FunnelGeneratorInput } from "@/modules/funnel-generator/types";
import { getCurrentUser } from "@/lib/auth";
import { canUseAiTools } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { validateOrigin } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { incrementAiUsage } from "@/lib/usage";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
    }
    const key = `ai:funnel:${getClientKey(request)}`;
    const { ok } = rateLimitAi(key);
    if (!ok) {
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
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
        { message: "Upgrade je plan om AI-tools te gebruiken." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Partial<FunnelGeneratorInput>;
    const businessType = (body.businessType ?? "").trim();
    if (!businessType) {
      return NextResponse.json(
        { message: "Type bedrijf is verplicht." },
        { status: 400 }
      );
    }
    const result = await generateFunnel({
      businessType,
      offer: body.offer?.trim(),
      targetAudience: body.targetAudience?.trim(),
    });
    if (user) await incrementAiUsage(user.id, "funnel-generator");
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "AI/FunnelGenerator");
  }
}
