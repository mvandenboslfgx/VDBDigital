import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function processProductOrderJob(productOrderId: string): Promise<{ productOrderId: string }> {
  try {
    const order = await prisma.productOrder.findUnique({
      where: { id: productOrderId },
      select: { id: true, userId: true, status: true, totalCents: true, currency: true },
    });

    if (!order) {
      throw new Error("ProductOrder not found");
    }

    if (order.status !== "paid") {
      return { productOrderId };
    }

    await prisma.auditLog.create({
      data: {
        event: "product_order_paid",
        userId: order.userId ?? undefined,
        metadata: {
          productOrderId: order.id,
          totalCents: order.totalCents,
          currency: order.currency,
        } as Prisma.InputJsonValue,
      },
    });

    return { productOrderId };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await prisma.productOrder.update({
      where: { id: productOrderId },
      data: {
        status: "failed",
        failureReason: reason.slice(0, 1000),
      },
    }).catch(() => undefined);
    throw err;
  }
}
