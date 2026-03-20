import { NextResponse } from "next/server";
import { z } from "zod";
import { createSecureRoute } from "@/lib/secureRoute";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const statusSchema = z.object({
    status: z.enum(["pending", "paid", "overdue", "cancelled"]),
  });

  const wrapper = createSecureRoute<{
    status: "pending" | "paid" | "overdue" | "cancelled";
  }>({
    auth: "admin",
    csrf: true,
    rateLimit: "api",
    logContext: "Admin/Invoices/[id]/PATCH",
    schema: statusSchema,
    invalidInputMessage: "Ongeldige invoer.",
    handler: async ({ input }) => {
      const invoice = await prisma.invoice.update({
        where: { id },
        data: { status: input.status },
      });
      return NextResponse.json({ success: true, invoice }, { status: 200 });
    },
  });

  return wrapper(request);
}
