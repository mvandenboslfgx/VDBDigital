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

    const packages = await prisma.packageConfig.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json(
      { success: true, message: "Packages loaded.", packages },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[Admin/Packages] GET error", error);
    }
    return NextResponse.json(
      { success: false, message: "Unable to load packages." },
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
      name?: string;
      price?: number;
      description?: string;
      active?: boolean;
    };

    const name = (body.name ?? "").trim();
    const description = (body.description ?? "").trim();
    const price = Number(body.price ?? 0);
    const active = body.active ?? true;

    if (!name || !description || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, description and positive price are required.",
        },
        { status: 400 }
      );
    }

    await prisma.packageConfig.upsert({
      where: { name },
      update: { description, price, active },
      create: { name, description, price, active },
    });

    return NextResponse.json(
      { success: true, message: "Package saved." },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[Admin/Packages] POST error", { error: String(error) });
    return NextResponse.json(
      { success: false, message: "Unable to save package." },
      { status: 500 }
    );
  }
}

