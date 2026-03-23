import { NextResponse } from "next/server";
import { getPublicDeploymentMeta } from "@/lib/deployment";

/**
 * Lightweight liveness for CI/CD and uptime checks — no DB, always 200 when the route is reachable.
 * For deep checks (DB, Stripe, AI) use GET /api/health instead.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const meta = getPublicDeploymentMeta();
  return NextResponse.json(
    {
      status: "ok",
      version: meta.version,
      releaseMode: meta.releaseMode,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
