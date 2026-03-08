import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validateOrigin } from "@/lib/apiSecurity";
import { rateLimitAi, getClientKey } from "@/lib/rateLimit";
import { generateOptimizations } from "@/modules/ai/optimizer";
import { handleApiError } from "@/lib/apiSafeResponse";

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Inloggen vereist" }, { status: 401 });
  }

  const key = `ai:optimize:${getClientKey(request)}`;
  const { ok } = rateLimitAi(key);
  if (!ok) {
    return NextResponse.json(
      { error: "Te veel aanvragen. Probeer het over een minuut opnieuw." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url.slice(0, 500) : undefined;
    const currentTitle = typeof body.currentTitle === "string" ? body.currentTitle.slice(0, 200) : undefined;
    const currentMetaDescription =
      typeof body.currentMetaDescription === "string" ? body.currentMetaDescription.slice(0, 500) : undefined;
    const currentH1 = typeof body.currentH1 === "string" ? body.currentH1.slice(0, 200) : undefined;
    const ctaCount = typeof body.ctaCount === "number" ? body.ctaCount : undefined;
    const industry = typeof body.industry === "string" ? body.industry.slice(0, 100) : undefined;

    const result = await generateOptimizations({
      url,
      currentTitle,
      currentMetaDescription,
      currentH1,
      ctaCount,
      industry,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    return handleApiError(e, "AI/Optimize");
  }
}
