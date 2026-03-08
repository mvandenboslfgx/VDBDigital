import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditAdminAction } from "@/lib/auditLog";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";
import type { UserRole } from "@prisma/client";

const updateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["lead", "customer", "pro", "admin"]).optional(),
  planId: z.string().uuid().nullable().optional(),
  disabledAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(request: Request) {
  try {
    const owner = await requireOwner();
    if (!owner) {
      return safeJsonError("Unauthorized. Owner only.", 403);
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return safeJsonError("Invalid payload", 400);
    }

    const { userId, role, planId, disabledAt } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return safeJsonError("User not found", 404);
    }

    // Do not allow changing owner's role or disabling owner
    if (existing.role === "owner") {
      return safeJsonError("Cannot modify owner user", 403);
    }

    const data: { role?: UserRole; planId?: string | null; disabledAt?: Date | null } = {};
    if (role !== undefined) data.role = role as UserRole;
    if (planId !== undefined) data.planId = planId;
    if (disabledAt !== undefined) data.disabledAt = disabledAt ? new Date(disabledAt) : null;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      include: { plan: true },
    });

    await auditAdminAction(owner.id, "owner_user_update", {
      targetUserId: userId,
      changes: Object.keys(data),
    });

    return NextResponse.json(
      { success: true, user: { id: updated.id, email: updated.email, role: updated.role, planId: updated.planId, disabledAt: updated.disabledAt } },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Admin/Users/Update");
  }
}
