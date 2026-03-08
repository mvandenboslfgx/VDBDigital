import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/notifications";
import { safeJsonError } from "@/lib/apiSafeResponse";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return safeJsonError("Unauthorized", 401);
    }
    const notifications = await getNotificationsForUser(user.id);
    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { notifications: [] },
      { status: 200 }
    );
  }
}
