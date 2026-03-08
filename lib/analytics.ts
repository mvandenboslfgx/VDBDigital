/**
 * Optional product analytics (PostHog or Plausible).
 * Client: set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST to enable PostHog.
 * Or use Plausible via script in layout when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 * Events: audit_started, audit_completed, upgrade_clicked, checkout_started, checkout_completed.
 */

export const ANALYTICS_EVENTS = {
  AUDIT_STARTED: "audit_started",
  AUDIT_COMPLETED: "audit_completed",
  UPGRADE_CLICKED: "upgrade_clicked",
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_COMPLETED: "checkout_completed",
  SCAN_STARTED: "scan_started",
  SCAN_COMPLETED: "scan_completed",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  LEAD_CAPTURED: "lead_captured",
} as const;

/**
 * Track event (server or client). Logs to console; in production also sends to PostHog if configured.
 */
export function trackEvent(event: string, data?: Record<string, unknown>): void {
  if (typeof console !== "undefined" && console.log) {
    console.log("analytics_event", event, data ?? {});
  }
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
    trackServerEvent(event, data as Record<string, string | number | boolean | undefined>);
  }
}

/** Server-side: track event via API or internal logging. No PII. */
export function trackServerEvent(
  event: string,
  props?: Record<string, string | number | boolean | undefined>
): void {
  if (process.env.NODE_ENV !== "production") return;
  // Optional: send to PostHog/Plausible server-side API
  if (process.env.POSTHOG_API_KEY) {
    try {
      fetch("https://eu.posthog.com/capture/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.POSTHOG_API_KEY,
          event,
          properties: { ...props, source: "vdb-digital-server" },
        }),
      }).catch(() => {});
    } catch {
      // No-op
    }
  }
}
