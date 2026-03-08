import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendClientAccountCreatedEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const current = await getCurrentUser();
    if (!current || (current.role !== "admin" && current.role !== "owner")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      leadId?: string;
      email?: string;
      projectName?: string;
      projectStatus?: string;
      sendInviteEmail?: boolean;
    };

    const leadId = body.leadId ?? "";
    const email = (body.email ?? "").trim().toLowerCase();
    const projectName = (body.projectName ?? "").trim();
    const projectStatus = body.projectStatus ?? "draft";
    const sendInviteEmail = body.sendInviteEmail ?? true;

    if (!leadId || !email || !projectName) {
      return NextResponse.json(
        {
          success: false,
          message: "leadId, email and projectName are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 }
      );
    }

    if (lead.convertedAt) {
      return NextResponse.json(
        { success: false, message: "Lead is already converted." },
        { status: 409 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name: lead.name,
        email: lead.email,
        leadId: lead.id,
      },
    });

    const project = await prisma.project.create({
      data: {
        name: projectName,
        status: projectStatus as "draft" | "in_progress" | "review" | "completed",
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

    await prisma.lead.update({
      where: { id: lead.id },
      data: { convertedAt: new Date() },
    });

    if (sendInviteEmail) {
      const baseUrl = process.env.SITE_URL ?? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
      try {
        await sendClientAccountCreatedEmail({
          to: client.email,
          clientName: client.name,
          loginUrl: `${baseUrl}/login`,
        });
      } catch {
        // ignore email failure
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead converted to client and project created. Client can sign up at /register and will be linked by email.",
        projectId: project.id,
        clientId: client.id,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[Admin/ConvertLead] Unexpected error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Unable to convert lead." },
      { status: 500 }
    );
  }
}
