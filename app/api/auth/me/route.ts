import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { rateLimitAuth, getClientKey } from "@/lib/rateLimit";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";

export async function GET(request: Request) {
  try {
    const key = `auth:me:${getClientKey(request)}`;
    const { ok } = rateLimitAuth(key);
    if (!ok) {
      logger.warn("[Security] Auth rate limit exceeded", { endpoint: "me" });
      return safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429);
    }

    const user = await getCurrentUser();
    if (!user) {
      return safeJsonError("Niet geauthenticeerd.", 401);
    }

    if (user.role === "admin" || user.role === "owner") {
      logger.info("[Security] Admin/Owner access", { userId: user.id, role: user.role });
    }

    return NextResponse.json(
      { success: true, message: "User loaded.", user },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Auth/Me");
  }
}

