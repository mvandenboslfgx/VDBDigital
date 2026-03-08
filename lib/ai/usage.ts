/**
 * AI usage tracking for monetization, abuse prevention, and analytics.
 */

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const AI_TOOLS_LIST = [
  "audit",
  "builder",
  "copy",
  "funnel-generator",
  "competitor-analyzer",
  "marketing-strategy",
  "landing-page",
  "seo-audit",
] as const;

export type AIToolName = (typeof AI_TOOLS_LIST)[number];

const AI_TOOLS = new Set<string>(AI_TOOLS_LIST);

export function isAITool(tool: string): tool is AIToolName {
  return AI_TOOLS.has(tool);
}

export interface RecordAIUsageInput {
  userId?: string | null;
  tool: string;
  tokens?: number;
  creditsUsed?: number;
}

/**
 * Record an AI tool usage. Fire-and-forget; never throws.
 */
export async function recordAIUsage(input: RecordAIUsageInput): Promise<void> {
  const tool = input.tool?.trim().slice(0, 80) || "unknown";
  try {
    await prisma.aIUsage.create({
      data: {
        userId: input.userId ?? null,
        tool,
        tokens: input.tokens ?? null,
        creditsUsed: input.creditsUsed ?? 0,
      },
    });
  } catch (err) {
    logger.warn("[AI/Usage] Failed to record usage", {
      tool,
      error: String(err),
    });
  }
}
