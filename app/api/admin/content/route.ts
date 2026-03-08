import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, validateCsrf } from "@/lib/auth";
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

    const blocks = await prisma.contentBlock.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json(
      { success: true, message: "Content loaded.", blocks },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[Admin/Content] GET error", error);
    }
    return NextResponse.json(
      { success: false, message: "Unable to load content." },
      { status: 500 }
    );
  }
}

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
      key?: string;
      value?: string;
    };

    const key = (body.key ?? "").trim();
    const value = (body.value ?? "").trim();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, message: "Both key and value are required." },
        { status: 400 }
      );
    }

    if (key.length > 100) {
      return NextResponse.json(
        { success: false, message: "Key is too long." },
        { status: 400 }
      );
    }

    await prisma.contentBlock.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(
      { success: true, message: "Content saved." },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[Admin/Content] POST error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Unable to save content." },
      { status: 500 }
    );
  }
}

