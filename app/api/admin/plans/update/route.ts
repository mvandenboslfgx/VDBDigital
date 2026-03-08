import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditAdminAction } from "@/lib/auditLog";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const schema = z.object({
  planId: z.string().uuid(),
  price: z.number().int().min(0).optional(),
  aiLimit: z.number().int().min(0).optional(),
  calculatorLimit: z.number().int().min(0).optional(),
  projectLimit: z.number().int().min(0).optional(),
});

export async function PATCH(request: Request) {
  try {
    const owner = await requireOwner();
    if (!owner) return safeJsonError("Unauthorized. Owner only.", 403);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return safeJsonError("Invalid payload", 400);

    const { planId, price, aiLimit, calculatorLimit, projectLimit } = parsed.data;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return safeJsonError("Plan not found", 404);

    const features = (plan.features as Record<string, unknown>) ?? {};
    if (aiLimit !== undefined) features.aiLimit = aiLimit;
    if (calculatorLimit !== undefined) features.calculatorLimit = calculatorLimit;
    if (projectLimit !== undefined) features.projectLimit = projectLimit;

    await prisma.plan.update({
      where: { id: planId },
      data: {
        ...(price !== undefined && { price }),
        features: features as object,
      },
    });

    await auditAdminAction(owner.id, "owner_plan_update", {
      planId,
      planName: plan.name,
      updates: Object.keys(parsed.data).filter((k) => k !== "planId"),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Admin/Plans/Update");
  }
}
