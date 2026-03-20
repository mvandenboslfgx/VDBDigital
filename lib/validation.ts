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

/** Auth/register-preference API body. */
export const registrationPreferenceBodySchema = z
  .object({
    email: emailSchema,
    newsletterOptIn: z.boolean().optional().default(false),
    // Honeypot/anti-bot: if provided, endpoint responds success without storing.
    website: z.string().max(500).optional().default(""),
  })
  .strict();

/** Newsletter subscribe API body. */
export const newsletterSubscribeBodySchema = z
  .object({
    email: emailSchema,
    source: z.string().max(50).optional().default("website"),
  })
  .strict();

/** Admin/create-invoice API body. */
export const adminCreateInvoiceBodySchema = z
  .object({
    clientId: z.string().min(1).max(64),
    amount: z.coerce.number().positive(),
    dueDate: z.string().datetime().optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
  })
  .strict();

/** Public review submission API body (supports JSON and HTML form). */
export const reviewSubmitBodySchema = z
  .object({
    name: z.string().max(80).optional().default(""),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    content: z.string().max(2000).optional().default(""),
    botField: z.string().max(100).optional().default(""),
    token: z.string().max(128).optional().default(""),
  })
  .strict();

const PRODUCT_UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const PRODUCT_UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Admin upload product image API body (multipart/form-data). */
export const adminProductUploadBodySchema = z
  .object({
    file: z.any().refine((f) => {
      if (typeof File === "undefined") return false;
      return f instanceof File;
    }, "Missing or invalid file")
      .refine((f) => PRODUCT_UPLOAD_ALLOWED_TYPES.includes((f as File).type as (typeof PRODUCT_UPLOAD_ALLOWED_TYPES)[number]), "Invalid file type")
      .refine((f) => Number((f as File).size) <= PRODUCT_UPLOAD_MAX_SIZE_BYTES, "File too large"),
  })
  .strict();

/** Public preview request API body. */
export const previewRequestBodySchema = z
  .object({
    businessName: z.string().max(120).optional().default(""),
    industry: z.string().max(120).optional().default(""),
    colorPreference: z.string().max(120).optional().default(""),
    style: z.string().max(40).optional().default("Luxury"),
    botField: z.string().max(100).optional().default(""),
  })
  .strict();

/** Authenticated website project creation body. */
export const websiteProjectCreateBodySchema = z
  .object({
    domain: z.string().max(253).optional().default(""),
  })
  .strict();

/** Authenticated portal support request body. */
export const portalSupportBodySchema = z
  .object({
    type: z.string().max(50).optional().default("support"),
    message: z.string().min(1).max(2000),
  })
  .strict();

/** Public analytics: track CTA or user events. */
export const analyticsTrackBodySchema = z
  .object({
    event: z.string().max(64),
    data: z.any().optional(),
  })
  .strict();

const ALLOWED_ANALYTICS_EVENT_TYPES = [
  "registration",
  "signup",
  "lead",
  "newsletter",
  "audit_started",
  "audit_completed",
  "lead_created",
  "upgrade_clicked",
] as const;

export const analyticsEventTypeSchema = z.enum(ALLOWED_ANALYTICS_EVENT_TYPES);

/** Public analytics: generic event endpoint. */
export const analyticsEventBodySchema = z
  .object({
    type: analyticsEventTypeSchema,
  })
  .strict();

/** Public analytics: record page visit. */
export const analyticsVisitBodySchema = z
  .object({
    path: z.string().max(500).optional(),
  })
  .strict();

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

/** Start Fix Engine v1 job (meta + H1 preview). */
export const websiteFixCreateBodySchema = z
  .object({
    websiteAuditId: z.string().min(1).max(80),
    issueId: z.string().min(1).max(80),
  })
  .strict();
export type WebsiteFixCreateBody = z.infer<typeof websiteFixCreateBodySchema>;

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
