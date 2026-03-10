import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimitSensitive, getClientKey } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/apiSecurity";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 9,
    });
    return NextResponse.json(
      { success: true, message: "Reviews loaded.", reviews },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[Review] Fetch error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Could not load reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const key = `review:${getClientKey(request)}`;
    const { ok } = rateLimitSensitive(key);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Too many reviews from this source." },
        { status: 429 }
      );
    }

    let body: {
      name?: string;
      rating?: number | string;
      content?: string;
      botField?: string;
      token?: string;
    };

    const contentType = request.headers.get("content-type") || "";

    if (contentType.startsWith("application/json")) {
      body = (await request.json()) as typeof body;
    } else {
      const form = await request.formData();
      body = {
        name: form.get("name")?.toString(),
        rating: form.get("rating")?.toString(),
        content: form.get("content")?.toString(),
        token: form.get("token")?.toString(),
      };
    }

    if (body.botField && body.botField.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Thank you for your review." },
        { status: 200 }
      );
    }

    const name = sanitizeString(body.name ?? "", 80);
    const content = sanitizeString(body.content ?? "", 2000);
    const rating = Number(body.rating ?? 0);

    if (!name || !content || Number.isNaN(rating)) {
      return NextResponse.json(
        { success: false, message: "Name, rating and review are required." },
        { status: 400 }
      );
    }

    if (name.length > 80 || content.length > 2000) {
      return NextResponse.json(
        { success: false, message: "One or more fields are too long." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be an integer between 1 and 5.",
        },
        { status: 400 }
      );
    }

    let projectId: string | undefined;

    if (body.token) {
      const tokenRecord = await prisma.reviewToken.findUnique({
        where: { token: body.token },
      });
      if (tokenRecord && !tokenRecord.usedAt) {
        projectId = tokenRecord.projectId;
        await prisma.reviewToken.update({
          where: { id: tokenRecord.id },
          data: { usedAt: new Date() },
        });
        await prisma.project.update({
          where: { id: tokenRecord.projectId },
          data: { satisfaction: rating },
        });
      }
    }

    await prisma.review.create({
      data: {
        name,
        rating,
        content,
        projectId,
      },
    });

    return NextResponse.json(
      { success: true, message: "Thank you. Your review has been submitted." },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[Review] Unexpected error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Something went wrong while saving review." },
      { status: 500 }
    );
  }
}

