/**
 * Poll fix job status: GET /api/dashboard/fix-jobs/status?jobId=
 */

import { NextResponse } from "next/server";
import { getWebsiteFixQueue } from "@/modules/fixes/queue";
import { rateLimitSensitive, getRateLimitKey } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const key = getRateLimitKey(request);
  const { ok } = rateLimitSensitive(key);
  if (!ok) {
    return NextResponse.json({ status: "error", message: "Too many requests" }, { status: 429 });
  }

  const queue = getWebsiteFixQueue();
  if (!queue) {
    return NextResponse.json(
      { status: "unavailable", message: "Queue not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId")?.trim();
  if (!jobId) {
    return NextResponse.json({ status: "error", message: "Missing jobId" }, { status: 400 });
  }

  try {
    const job = await queue.getJob(jobId);
    if (!job) {
      return NextResponse.json({ status: "not_found", message: "Job not found" }, { status: 404 });
    }

    const state = await job.getState();
    const result = job.returnvalue as { websiteFixId?: string } | undefined;
    const failedReason = job.failedReason;

    const response: {
      status: string;
      websiteFixId?: string;
      error?: string;
    } = { status: state };

    if (state === "completed" && result?.websiteFixId) {
      response.websiteFixId = result.websiteFixId;
    }
    if (state === "failed" && failedReason) {
      response.error = failedReason;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ status: "error", message: "Internal error" }, { status: 500 });
  }
}
