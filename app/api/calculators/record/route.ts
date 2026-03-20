import { NextResponse } from "next/server";
import { recordCalculatorResult } from "@/lib/calculators/record";
import { logger } from "@/lib/logger";
import { createSecureRoute } from "@/lib/secureRoute";
import { calculatorRecordBodySchema } from "@/lib/validation";
import { z } from "zod";

export const POST = createSecureRoute<
  z.infer<typeof calculatorRecordBodySchema>,
  undefined
>({
  auth: "required",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "json",
  schema: calculatorRecordBodySchema,
  invalidInputMessage: "Invalid request.",
  logContext: "Calculators/Record",
  handler: async ({ input, user }) => {
    try {
      void recordCalculatorResult({
        userId: user!.id,
        type: input.type,
        inputs: input.inputs,
        result: input.result,
      });
      return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
      logger.error("[Calculators/Record] Error", { error: String(error) });
      return NextResponse.json({ success: false, message: "Unable to record." }, { status: 500 });
    }
  },
});
