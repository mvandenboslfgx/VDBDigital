import { openai } from "@/lib/openai";
import type { BuilderInput, SiteStructure } from "./types";

type CacheEntry = {
  result: SiteStructure;
  expiresAt: number;
};

const builderCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function generateSiteStructure(
  input: BuilderInput
): Promise<SiteStructure> {
  const key = JSON.stringify(input);
  const cached = builderCache.get(key);

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
          "You are a senior UX architect for a high-end digital agency. Generate a clean website structure in JSON for the given business. Return a JSON object with keys home, services, about, contact. Each key contains: slug, title, headline, text (optional intro), sections[{id,title,description}], cta (call-to-action text). Keep sections focused and conversion-driven. Use Dutch copy.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content ?? "{}";

  let parsed: Partial<SiteStructure> = {};
  try {
    parsed = JSON.parse(rawContent) as Partial<SiteStructure>;
  } catch {
    // fall through
  }

  const fallbackSection = {
    id: "intro",
    title: "Digitale fundering",
    description:
      "Korte introductiesectie om direct duidelijk te maken wie je bent, wat je doet en voor wie.",
  };

  const ensurePage = (
    slug: "home" | "services" | "about" | "contact",
    suggested?: Partial<SiteStructure[keyof SiteStructure]>
  ) => ({
    slug,
    title:
      suggested?.title ??
      (slug === "home"
        ? "Home"
        : slug === "services"
        ? "Diensten"
        : slug === "about"
        ? "Over"
        : "Contact"),
    headline:
      suggested?.headline ??
      (slug === "home"
        ? "Digitale groei begint hier"
        : slug === "services"
        ? "Wat we voor je doen"
        : slug === "about"
        ? "Over ons"
        : "Neem contact op"),
    text: suggested?.text,
    sections:
      suggested?.sections && suggested.sections.length > 0
        ? suggested.sections
        : [fallbackSection],
    cta:
      suggested?.cta ??
      "Plan een gesprek",
  });

  const result: SiteStructure = {
    home: ensurePage("home", parsed.home),
    services: ensurePage("services", parsed.services),
    about: ensurePage("about", parsed.about),
    contact: ensurePage("contact", parsed.contact),
  };

  builderCache.set(key, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return result;
}

