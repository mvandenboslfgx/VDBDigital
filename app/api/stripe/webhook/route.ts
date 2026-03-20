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
import { MAX_BODY_BYTES_STRIPE_WEBHOOK } from "@/lib/requestSafety";
import { createSecureRoute } from "@/lib/secureRoute";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { addProductOrderJob } from "@/modules/commerce/queue";

const serverEnv = getServerEnv();
const stripe = serverEnv.STRIPE_SECRET_KEY ? new Stripe(serverEnv.STRIPE_SECRET_KEY) : null;
const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;

export const POST = createSecureRoute<string, undefined>({
  auth: "optional",
  rateLimit: "sensitive",
  csrf: false,
  bodyMode: "text",
  schema: z.string().min(1),
  invalidInputMessage: "Invalid payload.",
  maxBodyBytes: MAX_BODY_BYTES_STRIPE_WEBHOOK,
  logContext: "Stripe/Webhook",
  handler: async ({ input }) => {
    if (!stripe || !webhookSecret) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const headersList = await headers();
    const sig = headersList.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(input, sig, webhookSecret);
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
        const checkoutType = session.metadata?.checkoutType;

        if (checkoutType === "product_order") {
          const productOrderId = session.metadata?.productOrderId;
          if (!productOrderId) {
            logger.warn("[Stripe Webhook] product_order missing metadata.productOrderId", {
              sessionId: session.id,
            });
          } else {
            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id;
            const updatedOrder = await prisma.productOrder.update({
              where: { id: productOrderId },
              data: {
                status: "paid",
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: paymentIntentId ?? undefined,
                failureReason: null,
              },
              select: { id: true, userId: true },
            }).catch(() => null);

            if (!updatedOrder) {
              logger.warn("[Stripe Webhook] product_order not found", {
                productOrderId,
                sessionId: session.id,
              });
            } else {
              trackEvent("checkout_completed", {
                type: "product_order",
                orderId: updatedOrder.id.slice(0, 8),
                userId: updatedOrder.userId?.slice(0, 8),
              });
              runInBackground("enqueueProductOrderJob", async () => {
                const jobId = await addProductOrderJob({ productOrderId: updatedOrder.id });
                if (!jobId) {
                  logger.warn("[Stripe Webhook] Failed to enqueue product order job", {
                    productOrderId: updatedOrder.id,
                  });
                }
              });
            }
          }
        } else {
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
              runInBackground(
                "auditPlanUpgrade",
                () => auditPlanUpgrade(uid, resolved.planName, { source: "checkout.session.completed" })
              );
            }
          }
        }
      } else if (event.type === "customer.subscription.created") {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status === "active") {
          const priceId = sub.items.data[0]?.price.id;
          const resolved = priceId ? await resolvePlanFromPriceId(priceId) : null;
          if (resolved) {
            const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
            const user = await prisma.user.findFirst({
              where: { stripeCustomerId: customerId },
              select: { id: true },
            });
            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: { stripeSubscriptionId: sub.id, planId: resolved.planId, role: resolved.role },
              });
              runInBackground(
                "auditPlanUpgrade",
                () => auditPlanUpgrade(user.id, resolved.planName, { source: "subscription.created" })
              );
            }
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
            const firstUser = await prisma.user.findFirst({
              where: { stripeSubscriptionId: sub.id },
              select: { id: true },
            });
            if (firstUser)
              runInBackground(
                "auditPlanUpgrade",
                () => auditPlanUpgrade(firstUser.id, resolved.planName, { source: "subscription.updated" })
              );
          }
        }
      } else if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;
        const freePlan = await prisma.plan.findFirst({
          where: { name: "free" },
          select: { id: true },
        });
        if (!freePlan) {
          logger.error("[Stripe Webhook] subscription.deleted: no plan named 'free' in DB; clearing subscription without free plan", {
            subscriptionId: sub.id,
          });
        }
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            planId: freePlan?.id ?? null,
            stripeSubscriptionId: null,
            role: "lead",
          },
        });
        await recordUsageEvent("subscription_cancelled", undefined, { subscriptionId: sub.id });
      } else if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && invoice.customer_email) {
          trackEvent("invoice_paid", { subscriptionId: String(invoice.subscription) });
        }
      } else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn("[Stripe Webhook] Invoice payment failed", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription ?? undefined,
        });
      }
    } catch (e) {
      logger.error("[Stripe Webhook] Handler error", { error: String(e), type: event.type });
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const productOrderId = session.metadata?.productOrderId;
        if (session.metadata?.checkoutType === "product_order" && productOrderId) {
          await prisma.productOrder.update({
            where: { id: productOrderId },
            data: {
              status: "failed",
              failureReason: String(e).slice(0, 1000),
            },
          }).catch(() => undefined);
        }
      }
      // Release idempotency claim so Stripe retries can re-run the handler (otherwise the next
      // delivery hits the early duplicate path and returns 200 without applying business logic).
      // Use deleteMany (not delete) so missing rows don't throw; log + retry if DB flakes.
      try {
        const r = await prisma.processedStripeEvent.deleteMany({ where: { id: event.id } });
        // id is the Stripe event id (PK): count is 0 or 1, never >1 — no duplicate-row warn needed.
        if (r.count === 0) {
          logger.warn("[Stripe Webhook] Idempotency release: no row deleted", { eventId: event.id });
        }
      } catch (releaseErr) {
        logger.error("[Stripe Webhook] Idempotency release failed", {
          eventId: event.id,
          error: String(releaseErr),
        });
        try {
          await prisma.processedStripeEvent.deleteMany({ where: { id: event.id } });
        } catch (retryErr) {
          logger.error("[Stripe Webhook] Idempotency release retry failed", {
            eventId: event.id,
            error: String(retryErr),
          });
        }
      }
      return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  },
});
