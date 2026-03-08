/**
 * Environment: env object for app usage + optional Zod validation.
 */

import { z } from "zod";

/** Env proxy for app code (OPENAI, SMTP, JWT, etc.). */
export const env = {
  get OPENAI_API_KEY(): string | undefined {
    return process.env.OPENAI_API_KEY;
  },
  get SMTP_HOST(): string | undefined {
    return process.env.SMTP_HOST;
  },
  get SMTP_PORT(): number {
    const p = process.env.SMTP_PORT;
    return p ? parseInt(p, 10) : 587;
  },
  get SMTP_USER(): string | undefined {
    return process.env.SMTP_USER;
  },
  get SMTP_PASS(): string | undefined {
    return process.env.SMTP_PASS;
  },
  get JWT_SECRET(): string | undefined {
    return process.env.JWT_SECRET;
  },
  get ADMIN_EMAIL(): string {
    return process.env.ADMIN_EMAIL ?? process.env.SMTP_FROM ?? "algemeen@vdbdigital.nl";
  },
};

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_ID_PRO: z.string().optional(),
  STRIPE_PRICE_ID_BUSINESS: z.string().optional(),
  STRIPE_PRICE_ID_AGENCY: z.string().optional(),
  STRIPE_PRICE_ID_STARTER: z.string().optional(),
  STRIPE_PRICE_ID_GROWTH: z.string().optional(),
  JWT_SECRET: z.string().min(16).optional(),
  OPENAI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  SITE_URL: z.string().url().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;

/** Validate process.env against schema. Returns parsed env or throws. */
export function validateEnv(): EnvSchema {
  return envSchema.parse(process.env);
}

/** Safe parse: returns { success: true, data } or { success: false, error }. */
export function safeValidateEnv(): { success: true; data: EnvSchema } | { success: false; error: z.ZodError } {
  const result = envSchema.safeParse(process.env);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error };
}
