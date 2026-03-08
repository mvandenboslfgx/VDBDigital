import { NextResponse } from "next/server";
import { analyzeCompetitors } from "@/modules/competitor-analyzer/logic";
import type { CompetitorAnalyzerInput } from "@/modules/competitor-analyzer/types";
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
    const key = `ai:competitor:${getClientKey(request)}`;
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

    const body = (await request.json().catch(() => ({}))) as Partial<CompetitorAnalyzerInput>;
    const industry = (body.industry ?? "").trim();
    const city = (body.city ?? "").trim();

    if (!industry) {
      return NextResponse.json(
        { message: "Sector / branche is verplicht." },
        { status: 400 }
      );
    }

    const result = await analyzeCompetitors({ industry, city });
    if (user) await incrementAiUsage(user.id, "competitor-analyzer");

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "AI/CompetitorAnalyzer");
  }
}
