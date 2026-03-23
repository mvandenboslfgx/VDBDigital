import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { getControlCenterLiveData } from "@/lib/admin/control-center-live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** @deprecated Import from `@/lib/admin/control-center-live` instead */
export type {
  ActivityItem,
  ControlCenterLiveData,
} from "@/lib/admin/control-center-live";

export async function GET() {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized. Owner only." }, { status: 403 });
  }

  const data = await getControlCenterLiveData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
    },
  });
}
