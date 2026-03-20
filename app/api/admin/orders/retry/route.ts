import { NextResponse } from "next/server";
import { z } from "zod";
import { createSecureRoute } from "@/lib/secureRoute";
import { prisma } from "@/lib/prisma";
import { addProductOrderJob } from "@/modules/commerce/queue";

const retrySchema = z.object({
  orderId: z.string().min(1).max(100),
});

type RetryInput = z.infer<typeof retrySchema>;

export const POST = createSecureRoute<RetryInput, undefined>({
  auth: "admin",
  rateLimit: "admin",
  csrf: true,
  bodyMode: "json",
  schema: retrySchema,
  invalidInputMessage: "Ongeldige retry-aanvraag.",
  logContext: "Admin/OrdersRetry",
  handler: async ({ input }) => {
    const order = await prisma.productOrder.findUnique({
      where: { id: input.orderId },
      select: {
        id: true,
        status: true,
        stripePaymentIntentId: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order niet gevonden." }, { status: 404 });
    }

    // Failed orders with a payment intent represent post-payment processing failures.
    // Move them back to paid before reprocessing.
    if (order.status === "failed" && order.stripePaymentIntentId) {
      await prisma.productOrder.update({
        where: { id: order.id },
        data: {
          status: "paid",
          failureReason: null,
        },
      });
    } else if (order.status !== "paid") {
      return NextResponse.json(
        { error: "Alleen betaalde orders (of post-payment failed orders) kunnen worden geretried." },
        { status: 400 }
      );
    }

    const jobId = await addProductOrderJob({ productOrderId: order.id });
    if (!jobId) {
      return NextResponse.json({ error: "Queue niet beschikbaar voor retry." }, { status: 503 });
    }

    return NextResponse.json({ ok: true, jobId });
  },
});
