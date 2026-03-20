import { NextResponse } from "next/server";
import { getAuthLockoutKey, isLoginLockedOut } from "@/lib/rateLimit";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { createSecureRoute } from "@/lib/secureRoute";

export const GET = createSecureRoute<undefined>({
  auth: "optional",
  rateLimit: "auth",
  csrf: false,
  bodyMode: "none",
  logContext: "Auth/CheckLockout/GET",
  handler: async ({ request }) => {
    const lockoutKey = getAuthLockoutKey(request);
    if (isLoginLockedOut(lockoutKey)) {
      return safeJsonError("Account tijdelijk geblokkeerd. Probeer het over 15 minuten opnieuw.", 429);
    }
    return NextResponse.json({ allowed: true }, { status: 200 });
  },
});
