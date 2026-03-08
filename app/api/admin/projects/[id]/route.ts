import { NextResponse } from "next/server";
import type { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sendReviewRequestEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

const TRUSTPILOT_URL = process.env.TRUSTPILOT_URL ?? "https://www.trustpilot.com/review/vdb.digital";
const SITE_URL = process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireUser("admin");
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const { id } = await params;
    const body = (await request.json()) as { status?: string; showcase?: boolean };
    const current = await prisma.project.findUnique({
      where: { id },
      include: { client: true, reviewTokens: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!current) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
    }

    const newStatus = body.status as "draft" | "in_progress" | "review" | "completed" | undefined;
    const showcase = body.showcase;

    const updateData: { status?: ProjectStatus; showcase?: boolean } = {};
    if (newStatus && ["draft", "in_progress", "review", "completed"].includes(newStatus)) updateData.status = newStatus as ProjectStatus;
    if (typeof showcase === "boolean") updateData.showcase = showcase;

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    if (newStatus === "completed" && current.status !== "completed") {
      const token = current.reviewTokens[0];
      if (token) {
        const reviewLink = `${SITE_URL}/review/${token.token}`;
        try {
          await sendReviewRequestEmail({
            to: current.client.email,
            clientName: current.client.name,
            projectName: current.name,
            reviewLink,
            trustpilotLink: TRUSTPILOT_URL,
          });
        } catch {
          // ignore email failure
        }
      }
    }

    return NextResponse.json({ success: true, project: updated }, { status: 200 });
  } catch (error) {
    logger.error("[Admin/Projects] PATCH error", { error: String(error) });
    return NextResponse.json({ success: false, message: "Unable to update project." }, { status: 500 });
  }
}
