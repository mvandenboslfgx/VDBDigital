import { openai } from "@/lib/openai";
import type { CopyInput, CopyResult } from "./types";

type CacheEntry = {
  result: CopyResult;
  expiresAt: number;
};

const copyCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function generateMarketingCopy(
  input: CopyInput
): Promise<CopyResult> {
  const key = JSON.stringify(input);
  const cached = copyCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior brand copywriter for a luxury digital agency. Generate sharp, conversion-focused Dutch copy for a website. Respond strictly as a JSON object with keys: heroHeadline, servicesText, aboutSection, seoParagraph, ctaSection.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content ?? "{}";

  let parsed: Partial<CopyResult> = {};
  try {
    parsed = JSON.parse(rawContent) as Partial<CopyResult>;
  } catch {
    // fall through to defaults
  }

  const result: CopyResult = {
    heroHeadline:
      parsed.heroHeadline ??
      "Schaalbare digitale infrastructuur voor ambitieuze bedrijven.",
    servicesText:
      parsed.servicesText ??
      "We ontwerpen en bouwen websites, funnels en systemen die structureel nieuwe aanvragen opleveren.",
    aboutSection:
      parsed.aboutSection ??
      "VDB Digital combineert merkstrategie, UX-architectuur en development tot één schaalbaar groeiplatform.",
    seoParagraph:
      parsed.seoParagraph ??
      "Met een technisch schone basis, snelle laadtijden en heldere structuur leggen we een fundament waar zowel bezoekers als zoekmachines blij van worden.",
    ctaSection:
      parsed.ctaSection ??
      "Klaar om je digitale kanaal naar een hoger niveau te tillen? Plan een sessie en we verkennen samen de snelste route naar groei.",
  };

  copyCache.set(key, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return result;
}

