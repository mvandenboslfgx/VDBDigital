import { NextResponse } from "next/server";
import { getActivePlans } from "@/lib/plans";
import { handleApiError } from "@/lib/apiSafeResponse";
import { rateLimit, getClientKey } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    const key = `plans:${getClientKey(request)}`;
    const { ok } = rateLimit(key);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Te veel aanvragen." },
        { status: 429 }
      );
    }
    const plans = await getActivePlans();
    return NextResponse.json({ success: true, plans }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Plans");
  }
}
