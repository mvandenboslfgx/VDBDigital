import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";

export async function GET() {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return safeJsonError("Niet geautoriseerd.", 401);
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { auditResult: true, client: true },
    });

    return NextResponse.json(
      {
        success: true,
        leads: leads.map((l) => ({
          id: l.id,
          name: l.name,
          email: l.email,
          company: l.company,
          website: l.website,
          source: l.source,
          convertedAt: l.convertedAt,
          auditScore: l.auditResult?.score,
          createdAt: l.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Admin/Leads");
  }
}
