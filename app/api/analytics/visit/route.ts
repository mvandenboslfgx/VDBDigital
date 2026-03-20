import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { createSecureRoute } from "@/lib/secureRoute";
import { analyticsVisitBodySchema } from "@/lib/validation";
import { dedupeOnce } from "@/lib/dedupe";
import { getRequestFingerprintKey } from "@/lib/rateLimit";
import { z } from "zod";

export const POST = createSecureRoute<z.infer<typeof analyticsVisitBodySchema>, undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "json",
  schema: analyticsVisitBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  logContext: "Analytics/Visit",
  handler: async ({ input, request }) => {
    try {
      const minute = Math.floor(Date.now() / 60000);
      const fingerprint = getRequestFingerprintKey(request);
      const path = input.path ? sanitizeString(input.path, 500) : null;
      const dedupeKey = `analytics-visit:${fingerprint}:${path ?? ""}:${minute}`;
      const shouldProcess = await dedupeOnce(dedupeKey, 60);
      if (!shouldProcess) {
        return NextResponse.json({ success: true, message: "Visit recorded." }, { status: 201 });
      }

      await prisma.analyticsEvent.create({
        data: { type: "visit", path: path || undefined },
      });
      return NextResponse.json({ success: true, message: "Visit recorded." }, { status: 201 });
    } catch (error) {
      logger.error("[Analytics/Visit] Error", { error: String(error) });
      return NextResponse.json({ success: false, message: "Unable to record visit." }, { status: 500 });
    }
  },
});
