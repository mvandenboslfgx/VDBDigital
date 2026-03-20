import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { recordUsageEvent } from "@/lib/usage-events";
import { createSecureRoute } from "@/lib/secureRoute";
import { analyticsEventBodySchema } from "@/lib/validation";
import { dedupeOnce } from "@/lib/dedupe";
import { getRequestFingerprintKey } from "@/lib/rateLimit";

export const POST = createSecureRoute<{
  type: "registration" | "signup" | "lead" | "newsletter" | "audit_started" | "audit_completed" | "lead_created" | "upgrade_clicked";
}>({
  auth: "optional",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "json",
  schema: analyticsEventBodySchema,
  invalidInputMessage: "Invalid event type.",
  logContext: "Analytics/Event",
  handler: async ({ input, user, request }) => {
    try {
      const type = input.type;
      const minute = Math.floor(Date.now() / 60000);
      const fingerprint = getRequestFingerprintKey(request);
      const whoKey = user?.id ?? fingerprint;
      const dedupeKey = `analytics-event:${whoKey}:${type}:${minute}`;
      const shouldProcess = await dedupeOnce(dedupeKey, 60);
      if (!shouldProcess) {
        return NextResponse.json({ success: true }, { status: 201 });
      }

      await prisma.analyticsEvent.create({
        data: { type, userId: user?.id },
      });
      if (["signup", "audit_started", "audit_completed", "upgrade_clicked"].includes(type)) {
        await recordUsageEvent(type, user?.id);
      }
      return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
      logger.error("[Analytics/Event] Error", { error: String(error) });
      return NextResponse.json({ success: false, message: "Unable to record analytics event." }, { status: 500 });
    }
  },
});
