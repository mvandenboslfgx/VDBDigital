import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const { id } = await params;
    const body = (await _request.json()) as { status?: string };
    const status = body.status as "pending" | "paid" | "overdue" | "cancelled" | undefined;
    if (!status || !["pending", "paid", "overdue", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status required (pending, paid, overdue, cancelled)." },
        { status: 400 }
      );
    }
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, invoice }, { status: 200 });
  } catch (error) {
    logger.error("[Admin/Invoices] PATCH error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to update invoice." }, { status: 500 });
  }
}
