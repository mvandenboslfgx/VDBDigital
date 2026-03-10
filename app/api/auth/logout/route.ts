import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { getBaseUrl } from "@/lib/siteUrl";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login", getBaseUrl()), 302);
  } catch (error) {
    logger.error("[Auth/Logout] Unexpected error", { error: String(error) });
    return NextResponse.redirect(new URL("/login", getBaseUrl()), 302);
  }
}
