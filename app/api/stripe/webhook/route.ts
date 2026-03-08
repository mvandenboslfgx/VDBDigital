import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { recordUsageEvent } from "@/lib/usage-events";
import { auditPlanUpgrade } from "@/lib/auditLog";
import { runInBackground } from "@/lib/runInBackground";
import { logger } from "@/lib/logger";
import { resolvePlanFromPriceId } from "@/lib/stripe/resolvePlanFromPriceId";
import { trackEvent } from "@/lib/analytics";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    logger.warn("[Stripe Webhook] Signature verification failed", { error: String(err) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const existing = await prisma.processedStripeEvent.findUnique({ where: { id: event.id } }).catch(() => null);
  if (existing) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Claim idempotency key before processing so retries never double-apply
  try {
    await prisma.processedStripeEvent.create({ data: { id: event.id } });
  } catch (createErr) {
    const exists = await prisma.processedStripeEvent.findUnique({ where: { id: event.id } }).catch(() => null);
    if (exists) return NextResponse.json({ received: true }, { status: 200 });
    throw createErr;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.userId;
      if (session.subscription && typeof session.subscription === "string" && uid) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const priceId = sub.items.data[0]?.price.id;
        const resolved = priceId ? await resolvePlanFromPriceId(priceId) : null;
        await prisma.user.update({
          where: { id: uid },
          data: {
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: sub.id,
            ...(resolved && { planId: resolved.planId, role: resolved.role }),
          },
        });
        if (resolved) {
          trackEvent("checkout_completed", { plan: resolved.planName, userId: uid.slice(0, 8) });
          await recordUsageEvent("subscription_created", uid, { planId: resolved.planId });
          runInBackground("auditPlanUpgrade", () => auditPlanUpgrade(uid, resolved.planName, { source: "checkout.session.completed" }));
        }
      }
    } else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "active") {
        const priceId = sub.items.data[0]?.price.id;
        const resolved = priceId ? await resolvePlanFromPriceId(priceId) : null;
        if (resolved) {
          await prisma.user.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: { planId: resolved.planId, role: resolved.role },
          });
          const firstUser = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id }, select: { id: true } });
          if (firstUser) runInBackground("auditPlanUpgrade", () => auditPlanUpgrade(firstUser.id, resolved.planName, { source: "subscription.updated" }));
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const freePlan = await prisma.plan.findFirst({ where: { name: "free" } });
      if (freePlan) {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            planId: freePlan.id,
            stripeSubscriptionId: null,
            role: "lead",
          },
        });
        await recordUsageEvent("subscription_cancelled", undefined, { subscriptionId: sub.id });
      }
    }
  } catch (e) {
    logger.error("[Stripe Webhook] Handler error", { error: String(e), type: event.type });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
