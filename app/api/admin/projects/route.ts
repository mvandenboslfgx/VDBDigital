import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, validateCsrf } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (!(await validateCsrf(request))) {
      return NextResponse.json(
        { success: false, message: "Invalid CSRF token." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      clientId?: string;
      name?: string;
      status?: string;
    };

    const clientId = body.clientId ?? "";
    const name = (body.name ?? "").trim();
    const status = (body.status ?? "Onboarding").trim();

    if (!clientId || !name) {
      return NextResponse.json(
        { success: false, message: "clientId and name are required." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found." },
        { status: 404 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        status: (status as "draft" | "in_progress" | "review" | "completed") || "draft",
        clientId: client.id,
      },
    });

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await prisma.reviewToken.create({
      data: {
        token: crypto.randomUUID(),
        projectId: project.id,
        expiresAt: expires,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created.",
        projectId: project.id,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[Admin/Projects] Unexpected error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Unable to create project." },
      { status: 500 }
    );
  }
}

