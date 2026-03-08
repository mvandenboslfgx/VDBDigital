import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrSet, HEALTH_CACHE_KEY } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface HealthResponse {
  status: "ok" | "degraded";
  database: "ok" | "error";
  stripe: "ok" | "not_configured";
  ai: "ok" | "not_configured";
  timestamp: string;
}

/**
 * Health check for k8s/Vercel. Does not expose secrets.
 * GET /api/health — cached 45s to reduce DB checks.
 */
export async function GET() {
  const body = await getOrSet(
    HEALTH_CACHE_KEY,
    async (): Promise<HealthResponse> => {
      const timestamp = new Date().toISOString();
      let database: HealthResponse["database"] = "error";
      let stripe: HealthResponse["stripe"] = "not_configured";
      let ai: HealthResponse["ai"] = "not_configured";

      try {
        await prisma.$queryRaw`SELECT 1`;
        database = "ok";
      } catch {
        database = "error";
      }

      if (process.env.STRIPE_SECRET_KEY) {
        stripe = "ok";
      }

      if (process.env.OPENAI_API_KEY) {
        ai = "ok";
      }

      const status: HealthResponse["status"] =
        database === "ok" ? "ok" : "degraded";

      return {
        status,
        database,
        stripe,
        ai,
        timestamp,
      };
    },
    45_000
  );

  const httpStatus = body.status === "ok" ? 200 : 503;
  return NextResponse.json(body, { status: httpStatus });
}
