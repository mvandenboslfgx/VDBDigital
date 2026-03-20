import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getRateLimitKey } from "@/lib/rateLimit";
import { getBaseUrl } from "@/lib/siteUrl";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { trackEvent } from "@/lib/analytics";
import { withRetry } from "@/lib/retry";

const bodySchema = z.object({ productId: z.string().min(1) });

/**
 * POST /api/stripe/product-checkout
 * Create a Stripe Checkout session for a single product (one-time payment).
 * Redirects to Stripe Checkout; success/cancel URLs point back to site.
 */
export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    const rlKey = getRateLimitKey(request, user.id);
    const { ok } = rateLimitSensitive(`stripe:product-checkout:${rlKey}`);
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
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "productId is verplicht" }, { status: 400 });
    }
    const { productId } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product niet gevonden" }, { status: 404 });
    }

    const baseUrl = getBaseUrl();
    const origin = request.headers.get("origin") || baseUrl;

    const images: string[] = Array.isArray(product.images) ? (product.images as string[]) : [];
    const imageUrl =
      images.length > 0 && typeof images[0] === "string"
        ? images[0].startsWith("http")
          ? images[0]
          : `${baseUrl}${images[0].startsWith("/") ? "" : "/"}${images[0]}`
        : undefined;

    const unitAmount = Math.round(product.price * 100);
    const draftOrder = await prisma.productOrder.create({
      data: {
        userId: user.id,
        email: user.email,
        currency: "eur",
        totalCents: unitAmount,
        status: "pending",
        lineItems: [
          {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            unitAmount,
            quantity: 1,
          },
        ] as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
    try {
      session = await withRetry(() =>
        stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "eur",
                unit_amount: unitAmount,
                product_data: {
                  name: product.name,
                  description: product.shortDescription ?? product.description.slice(0, 160),
                  images: imageUrl ? [imageUrl] : undefined,
                },
              },
              quantity: 1,
            },
          ],
          success_url: `${origin}/products?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/products/${product.slug}`,
          customer_email: user.email,
          metadata: {
            checkoutType: "product_order",
            productOrderId: draftOrder.id,
            userId: user.id,
            productId: product.id,
            type: "product",
          },
        })
      );
    } catch {
      await prisma.productOrder.update({
        where: { id: draftOrder.id },
        data: { status: "failed", failureReason: "stripe_session_create_failed" },
      }).catch(() => undefined);
      return NextResponse.json({ error: "Checkout sessie kon niet worden aangemaakt." }, { status: 500 });
    }
    await prisma.productOrder.update({
      where: { id: draftOrder.id },
      data: { stripeCheckoutSessionId: session.id, failureReason: null },
    });
    trackEvent("checkout_started", {
      type: "product_single",
      orderId: draftOrder.id.slice(0, 8),
      userId: user.id.slice(0, 8),
      productId: product.id,
    });
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    return handleApiError(e, "StripeProductCheckout");
  }
}
