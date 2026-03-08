import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getRateLimitKey } from "@/lib/rateLimit";
import { checkoutPlanSchema, safeParse } from "@/lib/validation";
import { trackEvent } from "@/lib/analytics";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_ID_STARTER ?? process.env.STRIPE_PRICE_ID_PRO ?? "",
  growth: process.env.STRIPE_PRICE_ID_GROWTH ?? process.env.STRIPE_PRICE_ID_BUSINESS ?? "",
  agency: process.env.STRIPE_PRICE_ID_AGENCY ?? "",
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    const rlKey = getRateLimitKey(request, user.id);
    const { ok } = rateLimitSensitive(`stripe:checkout:${rlKey}`);
    if (!ok) {
      return NextResponse.json(
        { error: "Te veel aanvragen. Probeer het over een minuut opnieuw." },
        { status: 429 }
      );
    }
    if (!stripe) {
      return NextResponse.json({ error: "Stripe niet geconfigureerd" }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ongeldige JSON-body." }, { status: 400 });
    }
    const parsed = safeParse(checkoutPlanSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ongeldig plan. Kies starter, growth of agency." },
        { status: 400 }
      );
    }
    const plan = parsed.data.plan;
    const planKey = plan === "pro" ? "starter" : plan === "business" ? "growth" : plan;
    const priceId = PRICE_IDS[planKey] ?? PRICE_IDS.starter;
    if (!priceId) {
      return NextResponse.json({ error: "Ongeldig plan of prijs niet geconfigureerd" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    const baseUrl =
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";
    const origin = request.headers.get("origin") || baseUrl;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
    };

    if (dbUser?.stripeCustomerId) {
      sessionParams.customer = dbUser.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    trackEvent("checkout_started", { plan: planKey, userId: user.id.slice(0, 8) });
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    return handleApiError(e, "Stripe/CreateCheckoutSession");
  }
}
