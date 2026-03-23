/**
 * Release mode (Vercel env: set RELEASE_MODE=canary on Preview or a canary Production alias).
 * Use for gating experimental UI/API before full rollout.
 */
export function isCanary(): boolean {
  return process.env.RELEASE_MODE === "canary";
}

export function getReleaseMode(): "production" | "canary" | "preview" | "development" {
  if (process.env.RELEASE_MODE === "canary") return "canary";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (process.env.NODE_ENV === "development") return "development";
  return "production";
}
