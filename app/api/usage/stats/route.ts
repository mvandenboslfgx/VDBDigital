import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUsageStatsForDashboard } from "@/lib/usage-dashboard-stats";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const stats = await getUsageStatsForDashboard(user.id, user.email);
  return NextResponse.json({ stats });
}
