/**
 * Typed environment helpers with server/client split.
 * Keep parsing lazy so imports do not crash until a caller explicitly validates.
 */
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
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
    OPENAI_API_KEY: z.string().min(1).optional(),
    REDIS_URL: z.string().url().optional(),
    SITE_URL: z.string().url().optional(),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z
      .string()
      .regex(/^\d+$/)
      .optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    ADMIN_EMAIL: z.string().email().optional(),
  })
  .superRefine((data, ctx) => {
    if (!isProduction) return;

    const requiredInProduction = [
      "DATABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "OPENAI_API_KEY",
      "JWT_SECRET",
      "SITE_URL",
      "REDIS_URL",
    ] as const;

    for (const key of requiredInProduction) {
      if (!data[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required in production`,
        });
      }
    }
  });

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type EnvSchema = ServerEnv;

let cachedClientEnv: ClientEnv | null = null;
let cachedServerEnv: ServerEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;
  cachedClientEnv = clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedClientEnv;
}

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  cachedServerEnv = serverEnvSchema.parse(process.env);
  return cachedServerEnv;
}

/** Backward-compatible env proxy used across the existing codebase. */
export const env = {
  get OPENAI_API_KEY(): string | undefined {
    return process.env.OPENAI_API_KEY;
  },
  get SMTP_HOST(): string | undefined {
    return process.env.SMTP_HOST;
  },
  get SMTP_PORT(): number {
    const parsed = Number(process.env.SMTP_PORT ?? "587");
    return Number.isFinite(parsed) ? parsed : 587;
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

/** Validate process.env against the server schema. Returns parsed env or throws. */
export function validateEnv(): EnvSchema {
  return getServerEnv();
}

/** Safe parse: returns { success: true, data } or { success: false, error }. */
export function safeValidateEnv(): { success: true; data: EnvSchema } | { success: false; error: z.ZodError } {
  const result = serverEnvSchema.safeParse(process.env);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error };
}
