import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getRateLimitKey } from "@/lib/rateLimit";
import Stripe from "stripe";
import { z } from "zod";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const bodySchema = z.object({ productId: z.string().min(1) });

/**
 * POST /api/stripe/product-checkout
 * Create a Stripe Checkout session for a single product (one-time payment).
 * Redirects to Stripe Checkout; success/cancel URLs point back to site.
 */
export async function POST(request: Request) {
  try {
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

    const baseUrl =
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";
    const origin = request.headers.get("origin") || baseUrl;

    const images: string[] = Array.isArray(product.images) ? (product.images as string[]) : [];
    const imageUrl =
      images.length > 0 && typeof images[0] === "string"
        ? images[0].startsWith("http")
          ? images[0]
          : `${baseUrl}${images[0].startsWith("/") ? "" : "/"}${images[0]}`
        : undefined;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(product.price * 100),
            product_data: {
              name: product.name,
              description: product.shortDescription ?? product.description.slice(0, 160),
              images: imageUrl ? [imageUrl] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/products?checkout=success`,
      cancel_url: `${origin}/products/${product.slug}`,
      metadata: {
        userId: user.id,
        productId: product.id,
        type: "product",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    return handleApiError(e, "StripeProductCheckout");
  }
}
