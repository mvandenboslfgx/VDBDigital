/**
 * Deployment metadata (Vercel injects these at build/runtime).
 * Use for logging, client banners, support — not for security decisions alone.
 */
export interface DeploymentInfo {
  /** Git commit SHA when deployed from Git */
  version: string;
  /** Vercel deployment ID */
  deploymentId: string | null;
  /** Vercel environment */
  vercelEnv: "production" | "preview" | "development" | null;
  /** Hostname for this deployment */
  url: string | null;
  /** ISO timestamp if provided by platform */
  deployedAt: string | null;
}

export function getDeploymentInfo(): DeploymentInfo {
  return {
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.npm_package_version ?? "unknown",
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
    vercelEnv:
      process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview"
        ? process.env.VERCEL_ENV
        : process.env.NODE_ENV === "development"
          ? "development"
          : null,
    url: process.env.VERCEL_URL ?? process.env.VERCEL_BRANCH_URL ?? null,
    deployedAt: process.env.VERCEL_DEPLOYMENT_CREATED_AT ?? null,
  };
}

/** Safe subset for public /api responses */
export function getPublicDeploymentMeta() {
  const d = getDeploymentInfo();
  return {
    version: d.version,
    deploymentId: d.deploymentId,
    releaseMode: process.env.RELEASE_MODE ?? "production",
  };
}

/** Extra context for logs, support, future APM — geen PII. */
export function getDeploymentDiagnostics() {
  const d = getDeploymentInfo();
  return {
    ...d,
    node: process.version,
    region: process.env.VERCEL_REGION ?? null,
    runtime: "nodejs",
  };
}

/**
 * Hook voor gestructureerde errors (bijv. Sentry) — call vanuit error boundaries / API catch.
 * Nu: no-op; vervang door `Sentry.captureException` in productie.
 */
export function recordDeploymentError(_error: unknown, _context?: Record<string, string>): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[deployment]", _context, _error);
  }
}
