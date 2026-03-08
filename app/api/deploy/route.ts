import { NextResponse } from "next/server";
import { deployWebsite } from "@/modules/deploy/logic";
import { requireUser } from "@/lib/auth";
import type { DeployInput } from "@/modules/deploy/types";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Partial<DeployInput>;

    const businessType = (body.businessType ?? "").trim();
    if (!businessType) {
      return NextResponse.json(
        { message: "businessType is verplicht." },
        { status: 400 }
      );
    }

    const clientId = body.clientId ?? undefined;
    const projectId = body.projectId ?? undefined;
    if (clientId && user.role !== "admin") {
      return NextResponse.json(
        { message: "Alleen admins kunnen voor een client deployen." },
        { status: 403 }
      );
    }

    const result = await deployWebsite({
      businessType,
      city: body.city?.trim(),
      services: body.services?.filter(Boolean),
      designStyle: body.designStyle?.trim(),
      clientId,
      projectId,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    logger.error("[Deploy] Unexpected error", { error: String(error) });
    return NextResponse.json(
      {
        success: false,
        message: "Deploy-aanvraag mislukt.",
      },
      { status: 500 }
    );
  }
}
