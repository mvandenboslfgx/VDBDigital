import { NextResponse } from "next/server";
import { createSecureRoute } from "@/lib/secureRoute";

export const POST = createSecureRoute<undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "auth",
  bodyMode: "none",
  logContext: "Auth/Login/POST",
  handler: async () => {
    return NextResponse.json(
      { success: false, message: "Use Supabase Auth: sign in via the login page (client-side)." },
      { status: 410 }
    );
  },
});
