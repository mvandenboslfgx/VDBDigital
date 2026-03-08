import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
    return NextResponse.json({ success: true, invoices }, { status: 200 });
  } catch (error) {
    logger.error("[Admin/Invoices] GET error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to fetch invoices." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const body = (await request.json()) as {
      clientId?: string;
      amount?: number;
      dueDate?: string;
      description?: string;
    };
    const clientId = body.clientId ?? "";
    const amount = Number(body.amount) ?? 0;
    if (!clientId || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "clientId and positive amount required." },
        { status: 400 }
      );
    }
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        amount: Math.round(amount * 100),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        description: body.description ?? null,
      },
    });
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    logger.error("[Admin/Invoices] POST error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to create invoice." }, { status: 500 });
  }
}
