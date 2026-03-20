import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { createSecureRoute } from "@/lib/secureRoute";
import { adminCreateInvoiceBodySchema } from "@/lib/validation";

export const GET = createSecureRoute<undefined>({
  auth: "admin",
  rateLimit: "api",
  logContext: "Admin/Invoices/GET",
  handler: async ({ user }) => {
    // CreateSecureRoute already enforces admin/owner role.
    void user;

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
      },
      take: 100,
    });

    return NextResponse.json({ success: true, invoices }, { status: 200 });
  },
});

export const POST = createSecureRoute<{
  clientId: string;
  amount: number;
  dueDate?: string | null;
  description?: string | null;
}>({
  auth: "admin",
  csrf: true,
  rateLimit: "sensitive",
  logContext: "Admin/Invoices/POST",
  schema: adminCreateInvoiceBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  handler: async ({ input }) => {
    const clientId = input.clientId;
    const amountEuro = input.amount;
    if (!clientId || !Number.isFinite(amountEuro) || amountEuro <= 0) {
      return safeJsonError("clientId en positief bedrag vereist.", 400);
    }

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        amount: Math.round(amountEuro * 100),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        description: input.description ?? null,
      },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  },
});
