import OpenAI from "openai";
import { env } from "@/lib/env";

/**
 * Gedeelde OpenAI-client voor alle AI-functies op de site:
 * - Website-audit (/audit)
 * - AI Copy (/ai-copy)
 * - AI Website Builder (/builder)
 * - Competitor Analyzer (/competitor-analyzer)
 * - Funnel Builder (/funnel-builder)
 *
 * Zet OPENAI_API_KEY in je .env (zie .env.example) om deze functies te laten werken.
 */
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/** Default model for structured JSON responses (cost-effective, fast). */
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini" as const;

/** Options for chat completion with JSON response. */
export const jsonResponseFormat = { type: "json_object" as const };
