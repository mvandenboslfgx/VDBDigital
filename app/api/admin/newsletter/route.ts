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
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, subscribers }, { status: 200 });
  } catch (error) {
    logger.error("[Admin/Newsletter] GET error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to fetch subscribers." }, { status: 500 });
  }
}
