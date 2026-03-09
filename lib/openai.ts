import OpenAI from "openai";

/**
 * Gedeelde OpenAI-client voor alle AI-functies op de site.
 * Gebruik een placeholder-key wanneer OPENAI_API_KEY ontbreekt (bv. tijdens Vercel build),
 * zodat de module niet crasht; bij echte requests is de key in Vercel wél gezet.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-build",
});

/** Default model for structured JSON responses (cost-effective, fast). */
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini" as const;

/** Options for chat completion with JSON response. */
export const jsonResponseFormat = { type: "json_object" as const };
