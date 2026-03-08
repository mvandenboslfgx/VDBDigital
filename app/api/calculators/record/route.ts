import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { recordCalculatorResult } from "@/lib/calculators/record";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { validateOrigin } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { calculatorRecordBodySchema, safeParse } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { success: false, message: "Invalid origin." },
        { status: 403 }
      );
    }
    const key = `calculator:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Too many requests." },
        { status: 429 }
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = safeParse(calculatorRecordBodySchema, raw);
    if (!parsed.success) {
      const msg = (parsed.error.issues ?? (parsed.error as { errors?: { message: string }[] }).errors)
      ?.map((e: { message: string }) => e.message)
      .join("; ") || "Invalid request body.";
      return NextResponse.json(
        { success: false, message: msg },
        { status: 400 }
      );
    }
    const { type, inputs, result } = parsed.data;

    const user = await getCurrentUser();

    void recordCalculatorResult({
      userId: user?.id,
      type,
      inputs,
      result,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error("[Calculators/Record] Error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Unable to record." },
      { status: 500 }
    );
  }
}
