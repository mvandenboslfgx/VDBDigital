import { openai } from "@/lib/openai";
import type { FunnelGeneratorInput, FunnelGeneratorResult } from "./types";

type CacheEntry = { result: FunnelGeneratorResult; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function generateFunnel(
  input: FunnelGeneratorInput
): Promise<FunnelGeneratorResult> {
  const key = JSON.stringify(input);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a conversion-focused funnel strategist. Return JSON with:
- landingPageStructure: { headline, subheadline, sections: [{ title, description }], cta }
- offerIdea: { title, description, leadMagnet (optional) }
- emailFunnel: { subjectLines: string[], sequenceSteps: string[] }
- adIdeas: string[] (3-5 short ad angles)
Use Dutch. Keep copy punchy and conversion-focused.`,
      },
      { role: "user", content: JSON.stringify(input) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: FunnelGeneratorResult;
  try {
    const json = JSON.parse(raw) as Partial<FunnelGeneratorResult>;
    parsed = {
      landingPageStructure: json.landingPageStructure ?? {
        headline: "",
        subheadline: "",
        sections: [],
        cta: "",
      },
      offerIdea: json.offerIdea ?? { title: "", description: "" },
      emailFunnel: json.emailFunnel ?? { subjectLines: [], sequenceSteps: [] },
      adIdeas: Array.isArray(json.adIdeas) ? json.adIdeas : [],
    };
  } catch {
    parsed = {
      landingPageStructure: { headline: "", subheadline: "", sections: [], cta: "" },
      offerIdea: { title: "", description: "" },
      emailFunnel: { subjectLines: [], sequenceSteps: [] },
      adIdeas: [],
    };
  }
  cache.set(key, { result: parsed, expiresAt: Date.now() + CACHE_TTL_MS });
  return parsed;
}
