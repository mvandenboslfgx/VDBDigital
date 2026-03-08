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
    const logs = await prisma.maintenanceLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { website: { include: { client: true } } },
    });
    return NextResponse.json({ success: true, logs }, { status: 200 });
  } catch (error) {
    logger.error("[Admin/Maintenance] GET error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to fetch logs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const body = (await request.json()) as {
      websiteId?: string;
      type?: string;
      note?: string;
    };
    const websiteId = body.websiteId ?? "";
    const type = body.type as "update" | "backup" | "security_check" | "fix" | undefined;
    if (!websiteId || !type || !["update", "backup", "security_check", "fix"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "websiteId and type (update, backup, security_check, fix) required." },
        { status: 400 }
      );
    }
    const log = await prisma.maintenanceLog.create({
      data: {
        websiteId,
        type,
        note: body.note ?? null,
      },
    });
    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    logger.error("[Admin/Maintenance] POST error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to create maintenance log." }, { status: 500 });
  }
}
