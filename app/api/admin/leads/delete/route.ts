import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditAdminAction } from "@/lib/auditLog";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const schema = z.object({ leadId: z.string().uuid() });

export async function DELETE(request: Request) {
  try {
    const owner = await requireOwner();
    if (!owner) return safeJsonError("Unauthorized. Owner only.", 403);

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const parsed = schema.safeParse({ leadId });
    if (!parsed.success || !leadId) return safeJsonError("Invalid leadId", 400);

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return safeJsonError("Lead not found", 404);

    await prisma.lead.delete({ where: { id: leadId } });

    await auditAdminAction(owner.id, "owner_lead_delete", {
      leadId,
      email: lead.email.slice(0, 3) + "***",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Admin/Leads/Delete");
  }
}
