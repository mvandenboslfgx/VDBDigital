/**
 * Stripe client and config. Use in API routes only (server-side).
 */
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

const serverEnv = getServerEnv();
const stripe = serverEnv.STRIPE_SECRET_KEY ? new Stripe(serverEnv.STRIPE_SECRET_KEY) : null;

export function getStripe(): Stripe | null {
  return stripe;
}

export const STRIPE_WEBHOOK_SECRET = serverEnv.STRIPE_WEBHOOK_SECRET ?? "";

export const PRICE_IDS = {
  pro: serverEnv.STRIPE_PRICE_ID_PRO ?? "",
  business: serverEnv.STRIPE_PRICE_ID_BUSINESS ?? "",
  agency: serverEnv.STRIPE_PRICE_ID_AGENCY ?? "",
} as const;
