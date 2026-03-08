/**
 * API input validation using Zod.
 * Use parseOrThrow in route handlers; catch ZodError and return 400.
 */

import { z } from "zod";

/** Safe string, max length, optional trim. */
export const stringSchema = (max = 2000) =>
  z.string().max(max).transform((s) => s.trim());

/** String with min length (for required fields). */
const stringSchemaWithMin = (min: number, max: number, message: string) =>
  z.string().min(min, message).max(max).transform((s) => s.trim());

export const emailSchema = z.string().email().max(320);

/** Contact form body. */
export const contactBodySchema = z.object({
  name: stringSchemaWithMin(1, 200, "Naam is verplicht."),
  email: emailSchema,
  company: stringSchema(200).optional().default(""),
  message: stringSchemaWithMin(10, 5000, "Bericht moet minstens 10 tekens bevatten."),
  botField: stringSchema(100).optional(),
  website: stringSchema(500).optional(),
  turnstileToken: z.string().optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
});

/** Calculator record body. */
export const calculatorRecordBodySchema = z.object({
  type: z.enum([
    "roi",
    "breakEven",
    "priceIncrease",
    "subscriptionVsOneTime",
    "freelancerRate",
    "discountImpact",
    "financeCheck",
  ]),
  inputs: z.record(z.string(), z.unknown()).optional().default({}),
  result: z.record(z.string(), z.unknown()).optional().default({}),
});

/** Website audit / AI tools common: URL. */
export const urlSchema = z
  .string()
  .url()
  .max(2048)
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), "URL must be http or https");

/** Marketing strategy body. */
export const marketingStrategyBodySchema = z.object({
  businessDescription: stringSchema(4000),
});

/** Landing page body. */
export const landingPageBodySchema = z.object({
  productOrTopic: stringSchema(500),
  targetAudience: stringSchema(500).optional(),
});

/** SEO audit body. */
export const seoAuditBodySchema = z.object({
  url: urlSchema,
});

/** Stripe checkout: plan key. */
export const checkoutPlanSchema = z.object({
  plan: z.enum(["starter", "growth", "agency", "pro", "business"]).optional().default("starter"),
});
export type CheckoutPlanBody = z.infer<typeof checkoutPlanSchema>;

/** Website-audit API body (lead capture + optional preview). URL validated/sanitized in route. */
export const websiteAuditBodySchema = z.object({
  url: z.string().min(1, "URL is verplicht.").max(2048),
  email: z.string().max(320).optional().default(""),
  name: z.string().max(120).optional().default(""),
  company: z.string().max(120).optional().default(""),
  preview: z.boolean().optional().default(false),
  useQueue: z.boolean().optional().default(false),
});
export type WebsiteAuditBody = z.infer<typeof websiteAuditBodySchema>;

/**
 * Parse JSON body with schema; throw ZodError on failure.
 * In API routes: wrap in try/catch, on ZodError return 400 with error.flatten() or error.message.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe parse; returns { success: true, data } or { success: false, error: ZodError }.
 */
export function safeParse<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  return schema.safeParse(data) as { success: true; data: T } | { success: false; error: z.ZodError };
}
