import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sanitizeString } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const client = await prisma.client.findFirst({ where: { userId: user.id } });
    if (!client) {
      return NextResponse.json({ success: false, message: "No client profile." }, { status: 403 });
    }
    const body = (await request.json()) as { type?: string; message?: string };
    const type = sanitizeString(body.type ?? "support", 50);
    const message = sanitizeString(body.message ?? "", 2000);
    if (!message) {
      return NextResponse.json({ success: false, message: "Message required." }, { status: 400 });
    }
    const project = await prisma.project.findFirst({ where: { clientId: client.id }, orderBy: { createdAt: "desc" } });
    if (!project) {
      return NextResponse.json({ success: false, message: "No project found for this client." }, { status: 400 });
    }
    await prisma.projectRequest.create({
      data: { projectId: project.id, type, message },
    });
    return NextResponse.json({ success: true, message: "Request submitted." }, { status: 200 });
  } catch (error) {
    logger.error("[Portal/Support] Error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to submit." }, { status: 500 });
  }
}
