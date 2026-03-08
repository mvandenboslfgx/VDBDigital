/**
 * Stripe client and config. Use in API routes only (server-side).
 */
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function getStripe(): Stripe | null {
  return stripe;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO ?? "",
  business: process.env.STRIPE_PRICE_ID_BUSINESS ?? "",
  agency: process.env.STRIPE_PRICE_ID_AGENCY ?? "",
} as const;
