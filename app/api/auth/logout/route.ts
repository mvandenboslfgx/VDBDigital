import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { getBaseUrl } from "@/lib/siteUrl";
import { createSecureRoute } from "@/lib/secureRoute";

export const POST = createSecureRoute<undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "auth",
  bodyMode: "none",
  logContext: "Auth/Logout/POST",
  handler: async () => {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
      const res = NextResponse.redirect(new URL("/login", getBaseUrl()), 302);
      res.headers.set("Cache-Control", "no-store");
      return res;
    } catch (error) {
      logger.error("[Auth/Logout] Unexpected error", { error: String(error) });
      const res = NextResponse.redirect(new URL("/login", getBaseUrl()), 302);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
  },
});
