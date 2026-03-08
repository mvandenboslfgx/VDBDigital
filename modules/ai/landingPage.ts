/**
 * AI landing page content generator.
 * Returns headline, subheadline, sections, and call-to-action.
 */

import { openai } from "@/lib/openai";
import { DEFAULT_CHAT_MODEL, jsonResponseFormat } from "@/lib/openai";
import { incrementAiUsage } from "@/lib/usage";

export interface LandingPageInput {
  productOrTopic: string;
  targetAudience?: string;
}

export interface LandingPageResult {
  headline: string;
  subheadline: string;
  sections: string[];
  callToAction: string;
}

const SYSTEM_PROMPT = `You are a conversion-focused copywriter. Given a product or topic and optional target audience, generate landing page content. Respond with a JSON object with exactly these keys:
- headline: one short, punchy headline (max 10 words)
- subheadline: one supporting line (max 20 words)
- sections: array of 3-5 section body texts (each 1-3 sentences, value-focused)
- callToAction: one clear CTA phrase (e.g. "Start free trial", "Book a demo")

Respond only with valid JSON, no markdown.`;

export async function generateLandingPage(
  input: LandingPageInput,
  userId?: string | null
): Promise<LandingPageResult> {
  const productOrTopic =
    typeof input.productOrTopic === "string" && input.productOrTopic.trim()
      ? input.productOrTopic.trim().slice(0, 500)
      : "";
  const targetAudience =
    typeof input.targetAudience === "string" && input.targetAudience.trim()
      ? input.targetAudience.trim().slice(0, 200)
      : "";

  if (!productOrTopic) {
    return {
      headline: "",
      subheadline: "",
      sections: [],
      callToAction: "Get started",
    };
  }

  const userMessage = targetAudience
    ? `Product/topic: ${productOrTopic}\nTarget audience: ${targetAudience}`
    : productOrTopic;

  const completion = await openai.chat.completions.create({
    model: DEFAULT_CHAT_MODEL,
    response_format: jsonResponseFormat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<LandingPageResult> = {};
  try {
    parsed = JSON.parse(raw) as Partial<LandingPageResult>;
  } catch {
    // fallback
  }

  const result: LandingPageResult = {
    headline:
      typeof parsed.headline === "string" && parsed.headline.trim()
        ? parsed.headline.trim().slice(0, 120)
        : "Your headline here",
    subheadline:
      typeof parsed.subheadline === "string" && parsed.subheadline.trim()
        ? parsed.subheadline.trim().slice(0, 200)
        : "",
    sections: Array.isArray(parsed.sections)
      ? parsed.sections.filter((s) => typeof s === "string").slice(0, 6)
      : [],
    callToAction:
      typeof parsed.callToAction === "string" && parsed.callToAction.trim()
        ? parsed.callToAction.trim().slice(0, 60)
        : "Get started",
  };

  if (userId) {
    void incrementAiUsage(userId, "landing-page");
  }

  return result;
}
