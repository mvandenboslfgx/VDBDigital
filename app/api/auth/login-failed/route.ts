import { NextResponse } from "next/server";
import { getAuthLockoutKey, recordFailedLogin, isLoginLockedOut } from "@/lib/rateLimit";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { logger } from "@/lib/logger";
import { createSecureRoute } from "@/lib/secureRoute";

export const POST = createSecureRoute<undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "auth",
  bodyMode: "none",
  logContext: "Auth/LoginFailed/POST",
  handler: async ({ request }) => {
    const lockoutKey = getAuthLockoutKey(request);
    if (isLoginLockedOut(lockoutKey)) {
      logger.warn("[Security] Login attempt while locked out", { key: lockoutKey.slice(0, 30) });
      return safeJsonError("Account tijdelijk geblokkeerd. Probeer het over 15 minuten opnieuw.", 429);
    }
    recordFailedLogin(lockoutKey);
    return NextResponse.json({ success: true }, { status: 200 });
  },
});
