import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { lead: true },
    });

    return NextResponse.json(
      {
        success: true,
        clients: clients.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          leadSource: c.lead?.source,
          createdAt: c.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[Admin/Clients] Unexpected error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Unable to fetch clients." },
      { status: 500 }
    );
  }
}
