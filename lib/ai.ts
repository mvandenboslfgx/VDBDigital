/**
 * AI module entry. Re-exports for website audit, usage tracking, and OpenAI client.
 */
export { openai } from "@/lib/openai";
export type { FullAuditResult, AuditSignals, AuditScores } from "@/lib/ai-website-audit";
export { runFullWebsiteAudit, computeLeadScore, fetchAndParseSignals } from "@/lib/ai-website-audit";
export { recordAIUsage } from "@/lib/ai/usage";
