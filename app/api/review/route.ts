import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { sanitizeString } from "@/lib/apiSecurity";
import { createSecureRoute } from "@/lib/secureRoute";
import { reviewSubmitBodySchema } from "@/lib/validation";
import { z } from "zod";

export const GET = createSecureRoute<undefined>({
  auth: "optional",
  rateLimit: "api",
  logContext: "Review/GET",
  bodyMode: "none",
  handler: async () => {
    try {
      const reviews = await prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take: 9,
      });
      return NextResponse.json({ success: true, message: "Reviews loaded.", reviews }, { status: 200 });
    } catch (error) {
      logger.error("[Review] Fetch error", { error: String(error) });
      return NextResponse.json({ success: false, message: "Could not load reviews." }, { status: 500 });
    }
  },
});

export const POST = createSecureRoute<z.infer<typeof reviewSubmitBodySchema>, undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "auto",
  schema: reviewSubmitBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  logContext: "Review/POST",
  handler: async ({ input }) => {
    // Honeypot anti-bot: if set, acknowledge without saving.
    if (input.botField && input.botField.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Thank you for your review." }, { status: 200 });
    }

    const name = sanitizeString(input.name ?? "", 80);
    const content = sanitizeString(input.content ?? "", 2000);
    const rating = Number(input.rating ?? 0);

    if (!name || !content || Number.isNaN(rating)) {
      return NextResponse.json({ success: false, message: "Name, rating and review are required." }, { status: 400 });
    }

    if (name.length > 80 || content.length > 2000) {
      return NextResponse.json({ success: false, message: "One or more fields are too long." }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be an integer between 1 and 5." }, { status: 400 });
    }

    let projectId: string | undefined;
    try {
      if (input.token && input.token.trim().length > 0) {
        const tokenRecord = await prisma.reviewToken.findUnique({
          where: { token: input.token },
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
        data: { name, rating, content, projectId },
      });

      return NextResponse.json({ success: true, message: "Thank you. Your review has been submitted." }, { status: 201 });
    } catch (error) {
      logger.error("[Review] Unexpected error", { error: String(error) });
      return NextResponse.json({ success: false, message: "Something went wrong while saving review." }, { status: 500 });
    }
  },
});

