import { NextResponse } from "next/server";
import { generateSiteStructure } from "@/modules/ai-builder/logic";
import type { BuilderInput } from "@/modules/ai-builder/types";
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
    const key = `ai:builder:${getClientKey(request)}`;
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

    const body = (await request.json().catch(() => ({}))) as Partial<BuilderInput>;
    const businessType = (body.businessType ?? "").trim();
    const city = (body.city ?? "").trim();
    const style = (body.style ?? "").trim();
    const servicesArray =
      body.services?.map((s) => String(s).trim()).filter(Boolean) ?? [];

    if (!businessType) {
      return NextResponse.json(
        { message: "Type bedrijf is verplicht." },
        { status: 400 }
      );
    }

    const input: BuilderInput = {
      businessType,
      city,
      style: style || "Luxe, minimalistisch",
      services: servicesArray,
    };

    const structure = await generateSiteStructure(input);
    if (user) await incrementAiUsage(user.id, "builder");

    return NextResponse.json(
      {
        structure,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "AI/Builder");
  }
}

