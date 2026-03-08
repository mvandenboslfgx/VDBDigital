import { NextResponse } from "next/server";
import { getCurrentUser, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { handleApiError, safeJsonError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getRateLimitKey } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return safeJsonError("Ongeldige aanvraag.", 403);
    }
    const user = await getCurrentUser();
    if (!user) {
      return safeJsonError("Niet geautoriseerd.", 401);
    }
    const rlKey = getRateLimitKey(request, user.id);
    const { ok } = rateLimitSensitive(`stripe:portal:${rlKey}`);
    if (!ok) {
      logger.warn("[Security] Rate limit exceeded", { endpoint: "stripe/customer-portal" });
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }
    if (!stripe) {
      return safeJsonError("Stripe is niet geconfigureerd.", 503);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!dbUser?.stripeCustomerId) {
      return safeJsonError("Geen Stripe-klant gevonden. Upgrade eerst een plan.", 400);
    }

    const baseUrl =
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const returnUrl = `${baseUrl}/dashboard/billing`;

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    return handleApiError(e, "Stripe/CustomerPortal");
  }
}
