import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setAdminPresence } from "@/lib/chat-presence";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  setAdminPresence();
  return NextResponse.json({ success: true }, { status: 200 });
}
