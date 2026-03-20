import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { getOrSet, HEALTH_CACHE_KEY } from "@/lib/cache";
import { createSecureRoute } from "@/lib/secureRoute";

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
export const GET = createSecureRoute<undefined>({
  auth: "optional",
  csrf: false,
  rateLimit: "sensitive",
  bodyMode: "none",
  logContext: "Health/GET",
  handler: async ({ request }) => {
    const safeEquals = (a: string, b: string): boolean => {
      const aBuf = Buffer.from(a);
      const bBuf = Buffer.from(b);
      if (aBuf.length !== bBuf.length) return false;
      return timingSafeEqual(aBuf, bBuf);
    };

    const secret = process.env.HEALTHCHECK_SECRET?.trim();
    if (secret) {
      const provided =
        request.headers.get("x-health-secret") ??
        request.headers.get("x-healthcheck-secret") ??
        "";
      if (!safeEquals(provided, secret)) {
        const body: HealthResponse = {
          status: "degraded",
          database: "error",
          stripe: "not_configured",
          ai: "not_configured",
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(body, {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        });
      }
    }

    const body = await getOrSet(
      HEALTH_CACHE_KEY,
      async (): Promise<HealthResponse> => {
        const timestamp = new Date().toISOString();
        let database: HealthResponse["database"] = "error";
        let stripe: HealthResponse["stripe"] = "not_configured";
        let ai: HealthResponse["ai"] = "not_configured";

        try {
          // Ensure health endpoint never hangs on a dead/unreachable DB connection.
          const TIMEOUT_MS = 4000;
          const ok = await Promise.race([
            prisma.$queryRaw`SELECT 1`.then(() => true),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), TIMEOUT_MS)),
          ]);
          database = ok ? "ok" : "error";
        } catch {
          database = "error";
        }

        if (process.env.STRIPE_SECRET_KEY) {
          stripe = "ok";
        }

        if (process.env.OPENAI_API_KEY) {
          ai = "ok";
        }

        const status: HealthResponse["status"] = database === "ok" ? "ok" : "degraded";

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
    return NextResponse.json(body, {
      status: httpStatus,
      headers: {
        "Cache-Control": "public, s-maxage=45, stale-while-revalidate=60",
      },
    });
  },
});
