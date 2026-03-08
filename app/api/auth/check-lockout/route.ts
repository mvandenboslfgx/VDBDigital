import { NextResponse } from "next/server";
import { getClientKey, isLoginLockedOut } from "@/lib/rateLimit";
import { safeJsonError } from "@/lib/apiSafeResponse";

export async function GET(request: Request) {
  const ip = getClientKey(request);
  if (isLoginLockedOut(ip)) {
    return safeJsonError("Account tijdelijk geblokkeerd. Probeer het over 15 minuten opnieuw.", 429);
  }
  return NextResponse.json({ allowed: true }, { status: 200 });
}
