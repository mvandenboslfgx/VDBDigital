import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendClientAccountCreatedEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { z } from "zod";

const convertLeadSchema = z.object({
  leadId: z.string().min(1),
  email: z.email(),
  projectName: z.string().min(1),
  projectStatus: z.enum(["draft", "in_progress", "review", "completed"]).default("draft"),
  sendInviteEmail: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const current = await getCurrentUser();
    if (!current || (current.role !== "admin" && current.role !== "owner")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const parseResult = convertLeadSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input payload." },
        { status: 400 }
      );
    }
    const { leadId, email, projectName, projectStatus, sendInviteEmail } =
      parseResult.data;

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
        email,
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
      const baseUrl =
        process.env.SITE_URL ??
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
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
