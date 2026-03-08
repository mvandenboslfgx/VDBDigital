import { NextResponse } from "next/server";
import { isAdminOnline } from "@/lib/chat-presence";

export async function GET() {
  return NextResponse.json({ adminOnline: isAdminOnline() }, { status: 200 });
}
