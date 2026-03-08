import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login", process.env.SITE_URL ?? "http://localhost:3000"), 302);
  } catch (error) {
    logger.error("[Auth/Logout] Unexpected error", { error: String(error) });
    const base = process.env.SITE_URL ?? "http://localhost:3000";
    return NextResponse.redirect(new URL("/login", base), 302);
  }
}
