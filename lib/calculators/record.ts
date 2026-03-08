/**
 * Calculator result recording for lead magnets and analytics.
 */

import type { CalculatorType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const CALCULATOR_TYPES: CalculatorType[] = [
  "roi",
  "breakEven",
  "priceIncrease",
  "subscriptionVsOneTime",
  "freelancerRate",
  "discountImpact",
  "financeCheck",
];

export function isCalculatorType(value: string): value is CalculatorType {
  return CALCULATOR_TYPES.includes(value as CalculatorType);
}

export interface RecordCalculatorResultInput {
  userId?: string | null;
  type: CalculatorType;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
}

/**
 * Record a calculator use. Fire-and-forget; never throws.
 */
export async function recordCalculatorResult(
  input: RecordCalculatorResultInput
): Promise<void> {
  try {
    await prisma.calculatorResult.create({
      data: {
        userId: input.userId ?? null,
        type: input.type,
        inputs: input.inputs as object,
        result: input.result as object,
      },
    });
    const { auditCalculatorUsed } = await import("@/lib/auditLog");
    void auditCalculatorUsed(input.userId ?? null, input.type);
  } catch (err) {
    logger.warn("[Calculators] Failed to record result", {
      type: input.type,
      error: String(err),
    });
  }
}
