import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { createSecureRoute } from "@/lib/secureRoute";

export const GET = createSecureRoute<undefined>({
  auth: "required",
  rateLimit: "auth",
  logContext: "Auth/Me",
  handler: async ({ user, requestId }) => {
    if (!user) return safeJsonError("Niet geauthenticeerd.", 401);
    if (user.role === "admin" || user.role === "owner") {
      logger.info("[Security] Admin/Owner access", { userId: user.id, role: user.role, requestId });
    }
    return NextResponse.json({ success: true, message: "User loaded.", user }, { status: 200 });
  },
});

