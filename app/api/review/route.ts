import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;

const rateLimitStore = new Map<
  string,
  { count: number; firstRequestTimestamp: number }
>();

const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

const getClientIdentifier = (request: Request) => {
  const forwarded =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";
  return forwarded.split(",")[0].trim() || "anonymous";
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstRequestTimestamp: now });
    return false;
  }
  if (now - entry.firstRequestTimestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, firstRequestTimestamp: now });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  return false;
};

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
    const clientId = getClientIdentifier(request);
    if (isRateLimited(`review:${clientId}`)) {
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

    const name = sanitize(body.name ?? "");
    const content = sanitize(body.content ?? "");
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

