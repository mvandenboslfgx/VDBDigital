import { NextResponse } from "next/server";
import { getClientKey, recordFailedLogin, isLoginLockedOut, rateLimitAuth } from "@/lib/rateLimit";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const ip = getClientKey(request);
  const key = `auth:login-failed:${ip}`;
  const { ok } = rateLimitAuth(key);
  if (!ok) {
    return safeJsonError("Te veel pogingen. Probeer het later opnieuw.", 429);
  }
  if (isLoginLockedOut(ip)) {
    logger.warn("[Security] Login attempt while locked out", { key: ip.slice(0, 30) });
    return safeJsonError("Account tijdelijk geblokkeerd. Probeer het over 15 minuten opnieuw.", 429);
  }
  recordFailedLogin(ip);
  return NextResponse.json({ success: true }, { status: 200 });
}
