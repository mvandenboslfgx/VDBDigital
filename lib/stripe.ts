/**
 * Stripe client and config. Use in API routes only (server-side).
 */
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

export function getStripe(): Stripe | null {
  const serverEnv = getServerEnv();
  return serverEnv.STRIPE_SECRET_KEY ? new Stripe(serverEnv.STRIPE_SECRET_KEY) : null;
}

export function getStripeWebhookSecret(): string {
  return getServerEnv().STRIPE_WEBHOOK_SECRET ?? "";
}

export function getStripePriceIds() {
  const serverEnv = getServerEnv();
  return {
    pro: serverEnv.STRIPE_PRICE_ID_PRO ?? "",
    business: serverEnv.STRIPE_PRICE_ID_BUSINESS ?? "",
    agency: serverEnv.STRIPE_PRICE_ID_AGENCY ?? "",
  } as const;
}
