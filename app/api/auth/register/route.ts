import { NextResponse } from "next/server";
import { rateLimitAuth, getClientKey } from "@/lib/rateLimit";
import { safeJsonError } from "@/lib/apiSafeResponse";

export async function POST(request: Request) {
  const key = `auth:register:${getClientKey(request)}`;
  const { ok } = rateLimitAuth(key);
  if (!ok) {
    return safeJsonError("Te veel pogingen. Probeer het later opnieuw.", 429);
  }
  return NextResponse.json(
    { success: false, message: "Use Supabase Auth: sign up via the register page (client-side)." },
    { status: 410 }
  );
}
