import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";
import { createSecureRoute } from "@/lib/secureRoute";
import { analyticsTrackBodySchema } from "@/lib/validation";
import { dedupeOnce } from "@/lib/dedupe";
import { getRequestFingerprintKey } from "@/lib/rateLimit";
import { z } from "zod";

/**
 * Client-side analytics: POST { event: string, data?: object } to track events (e.g. upgrade_clicked).
 * Protected by origin check and rate limit; no auth required for anonymous events.
 */
export const POST = createSecureRoute<z.infer<typeof analyticsTrackBodySchema>, undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "json",
  schema: analyticsTrackBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  logContext: "Analytics/Track",
  handler: async ({ input, request }) => {
    const event = input.event.trim();
    const minute = Math.floor(Date.now() / 60000);
    const fingerprint = getRequestFingerprintKey(request);
    const dedupeKey = `analytics-track:${fingerprint}:${event}:${minute}`;
    const shouldProcess = await dedupeOnce(dedupeKey, 60);
    if (!shouldProcess) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    trackEvent(event, input.data);
    return NextResponse.json({ ok: true }, { status: 200 });
  },
});
