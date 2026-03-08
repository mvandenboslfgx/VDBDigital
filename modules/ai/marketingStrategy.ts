/**
 * AI marketing strategy generator.
 * Returns marketing channels, campaign ideas, and positioning advice from a business description.
 */

import { openai } from "@/lib/openai";
import { DEFAULT_CHAT_MODEL, jsonResponseFormat } from "@/lib/openai";
import { incrementAiUsage } from "@/lib/usage";

export interface MarketingStrategyResult {
  marketingChannels: string[];
  campaignIdeas: string[];
  positioningAdvice: string;
}

const SYSTEM_PROMPT = `You are a senior marketing strategist. Given a business description, respond with a JSON object with exactly these keys:
- marketingChannels: array of 5-8 recommended marketing channels (e.g. "LinkedIn", "Google Ads", "Content marketing")
- campaignIdeas: array of 4-6 concrete campaign ideas (short, actionable)
- positioningAdvice: a single string (2-4 sentences) with positioning and messaging advice

Respond only with valid JSON, no markdown.`;

export async function generateMarketingStrategy(
  businessDescription: string,
  userId?: string | null
): Promise<MarketingStrategyResult> {
  const description =
    typeof businessDescription === "string" && businessDescription.trim()
      ? businessDescription.trim().slice(0, 3000)
      : "";

  if (!description) {
    return {
      marketingChannels: [],
      campaignIdeas: [],
      positioningAdvice: "Provide a business description to get tailored advice.",
    };
  }

  const completion = await openai.chat.completions.create({
    model: DEFAULT_CHAT_MODEL,
    response_format: jsonResponseFormat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: description },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<MarketingStrategyResult> = {};
  try {
    parsed = JSON.parse(raw) as Partial<MarketingStrategyResult>;
  } catch {
    // fallback
  }

  const result: MarketingStrategyResult = {
    marketingChannels: Array.isArray(parsed.marketingChannels)
      ? parsed.marketingChannels.filter((c) => typeof c === "string").slice(0, 10)
      : [],
    campaignIdeas: Array.isArray(parsed.campaignIdeas)
      ? parsed.campaignIdeas.filter((c) => typeof c === "string").slice(0, 8)
      : [],
    positioningAdvice:
      typeof parsed.positioningAdvice === "string" && parsed.positioningAdvice.trim()
        ? parsed.positioningAdvice.trim().slice(0, 1500)
        : "Focus on your unique value and target audience.",
  };

  if (userId) {
    void incrementAiUsage(userId, "marketing-strategy");
  }

  return result;
}
