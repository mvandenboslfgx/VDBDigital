import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeEmail } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { createSecureRoute } from "@/lib/secureRoute";
import { newsletterSubscribeBodySchema } from "@/lib/validation";

export const POST = createSecureRoute<{
  email: string;
  source?: string;
}>({
  auth: "optional",
  csrf: true,
  rateLimit: "sensitive",
  logContext: "Newsletter/Subscribe",
  schema: newsletterSubscribeBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  handler: async ({ input, requestId }) => {
    const email = sanitizeEmail(input.email);
    if (!email) return safeJsonError("Valid email is required.", 400, { requestId });

    const source = (input.source ?? "website").slice(0, 50);
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source },
      update: {},
    });

    logger.info("[Newsletter] Subscribed", { email: email.slice(0, 3) + "***", requestId });
    return NextResponse.json({ success: true, message: "Subscribed successfully." }, { status: 200 });
  },
});
