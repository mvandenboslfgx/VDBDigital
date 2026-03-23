export interface HealthLikeResponse {
  status: "ok" | "degraded";
  database: "ok" | "error";
  stripe: "ok" | "not_configured";
  ai: "ok" | "not_configured";
  timestamp?: string;
}

export type IncidentSeverity = "low" | "medium" | "critical";
export type IncidentSource = "health" | "sentry" | "manual" | "other";

export interface DetectedIncident {
  severity: IncidentSeverity;
  reason: string;
  source: IncidentSource;
  errorSummary?: string;
}

export function detectIncidentFromHealth(health: HealthLikeResponse, httpStatus: number): DetectedIncident | null {
  // Health already returns `status` and uses 503 when degraded.
  if (httpStatus === 200 && health.status === "ok") return null;

  const databasePart = health.database === "ok" ? "database ok" : "database error";
  const stripePart = health.stripe === "ok" ? "stripe ok" : "stripe not configured";
  const aiPart = health.ai === "ok" ? "ai ok" : "ai not configured";

  const severity: IncidentSeverity = health.status === "degraded" ? "critical" : "medium";

  return {
    severity,
    source: "health",
    reason: `Health degraded (http=${httpStatus}, status=${health.status})`,
    errorSummary: `${databasePart}; ${stripePart}; ${aiPart}`,
  };
}

