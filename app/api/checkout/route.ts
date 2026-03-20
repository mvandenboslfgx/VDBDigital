import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { createSecureRoute } from "@/lib/secureRoute";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getTrustedOrigin } from "@/lib/siteUrl";
import { trackEvent } from "@/lib/analytics";
import { withRetry } from "@/lib/retry";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(50),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

export const POST = createSecureRoute<CheckoutInput, undefined>({
  auth: "required",
  rateLimit: "sensitive",
  csrf: true,
  bodyMode: "json",
  schema: checkoutSchema,
  invalidInputMessage: "Ongeldige checkout-invoer.",
  logContext: "Checkout/CreateSession",
  handler: async ({ request, user, input }) => {
    const stripe = getStripe();
    if (!stripe || !user) {
      return NextResponse.json({ error: "Checkout is niet beschikbaar." }, { status: 503 });
    }

    const uniqueProductIds = [...new Set(input.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
      },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const lineItems: Prisma.InputJsonValue[] = [];
    const stripeLineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalCents = 0;

    for (const item of input.items) {
      const product = productById.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Een product in je winkelwagen bestaat niet meer." }, { status: 400 });
      }
      if (item.quantity > product.stock) {
        return NextResponse.json(
          { error: `Voor ${product.name} is onvoldoende voorraad beschikbaar.` },
          { status: 400 }
        );
      }

      const unitAmount = Math.round(product.price * 100);
      totalCents += unitAmount * item.quantity;

      lineItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        unitAmount,
        quantity: item.quantity,
      });

      stripeLineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: unitAmount,
          product_data: {
            name: product.name,
          },
        },
      });
    }

    const draftOrder = await prisma.productOrder.create({
      data: {
        userId: user.id,
        email: user.email,
        currency: "eur",
        totalCents,
        status: "pending",
        lineItems: lineItems as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    try {
      const origin = getTrustedOrigin(request.headers.get("origin"));

      const session = await withRetry(() =>
        stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: stripeLineItems,
          success_url: `${origin}/products?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/cart`,
          customer_email: user.email,
          metadata: {
            checkoutType: "product_order",
            productOrderId: draftOrder.id,
            userId: user.id,
          },
        })
      );

      await prisma.productOrder.update({
        where: { id: draftOrder.id },
        data: {
          stripeCheckoutSessionId: session.id,
          failureReason: null,
        },
      });

      trackEvent("checkout_started", {
        type: "product_order",
        orderId: draftOrder.id.slice(0, 8),
        userId: user.id.slice(0, 8),
      });

      return NextResponse.json({ url: session.url, sessionId: session.id, orderId: draftOrder.id });
    } catch {
      await prisma.productOrder.update({
        where: { id: draftOrder.id },
        data: { status: "failed", failureReason: "stripe_session_create_failed" },
      }).catch(() => undefined);
      return NextResponse.json({ error: "Checkout sessie kon niet worden aangemaakt." }, { status: 500 });
    }
  },
});
