import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { createSecureRoute } from "@/lib/secureRoute";
import { portalSupportBodySchema } from "@/lib/validation";
import { z } from "zod";

export const POST = createSecureRoute<z.infer<typeof portalSupportBodySchema>, undefined>({
  auth: "required",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "json",
  schema: portalSupportBodySchema,
  invalidInputMessage: "Message required.",
  logContext: "Portal/Support",
  handler: async ({ input, user }) => {
    try {
      const client = await prisma.client.findFirst({ where: { userId: user!.id } });
      if (!client) {
        return NextResponse.json({ success: false, message: "No client profile." }, { status: 403 });
      }

      const type = sanitizeString(input.type ?? "support", 50);
      const message = sanitizeString(input.message ?? "", 2000);
      if (!message) {
        return NextResponse.json({ success: false, message: "Message required." }, { status: 400 });
      }

      const project = await prisma.project.findFirst({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
      });
      if (!project) {
        return NextResponse.json(
          { success: false, message: "No project found for this client." },
          { status: 400 }
        );
      }

      await prisma.projectRequest.create({
        data: { projectId: project.id, type, message },
      });
      return NextResponse.json({ success: true, message: "Request submitted." }, { status: 200 });
    } catch (error) {
      logger.error("[Portal/Support] Error", { error: String(error) });
      return NextResponse.json({ success: false, message: "Unable to submit." }, { status: 500 });
    }
  },
});
