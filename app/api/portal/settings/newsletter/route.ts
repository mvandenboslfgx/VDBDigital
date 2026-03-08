import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }
    const body = (await request.json()) as { newsletterOptIn?: boolean };
    const newsletterOptIn = body.newsletterOptIn === true;

    await prisma.user.update({
      where: { id: user.id },
      data: { newsletterOptIn },
    });

    if (newsletterOptIn) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: user.email },
        create: { email: user.email, source: "portal" },
        update: {},
      });
    } else {
      await prisma.newsletterSubscriber.deleteMany({
        where: { email: user.email },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    logger.error("[Portal/Settings/Newsletter] Error", { error: String(e) });
    return NextResponse.json(
      { success: false, message: "Unable to update preference." },
      { status: 500 }
    );
  }
}
