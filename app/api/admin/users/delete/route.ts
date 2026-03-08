import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditAdminAction } from "@/lib/auditLog";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const deleteSchema = z.object({
  userId: z.string().uuid(),
});

export async function DELETE(request: Request) {
  try {
    const owner = await requireOwner();
    if (!owner) {
      return safeJsonError("Unauthorized. Owner only.", 403);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const parsed = deleteSchema.safeParse({ userId });
    if (!parsed.success || !userId) {
      return safeJsonError("Invalid userId", 400);
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return safeJsonError("User not found", 404);
    }

    if (existing.role === "owner") {
      return safeJsonError("Cannot delete owner user", 403);
    }

    await prisma.user.delete({ where: { id: userId } });

    await auditAdminAction(owner.id, "owner_user_delete", {
      targetUserId: userId,
      targetEmail: existing.email.slice(0, 3) + "***",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Admin/Users/Delete");
  }
}
