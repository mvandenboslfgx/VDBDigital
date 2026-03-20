/**
 * BullMQ worker for website fix jobs. Run: npx tsx scripts/run-fix-worker.ts
 */

import { Worker } from "bullmq";
import { processWebsiteFixJob } from "./process-fix-job";
import type { WebsiteFixJobData, WebsiteFixJobResult } from "./queue";

function getConnectionOptions(): import("bullmq").ConnectionOptions {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is required for the fix worker");
  const u = new URL(url);
  return {
    host: u.hostname || "localhost",
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
  };
}

const QUEUE_NAME = "website-fix";

export function startWebsiteFixWorker(): Worker<WebsiteFixJobData, WebsiteFixJobResult> {
  const connection = getConnectionOptions();
  const worker = new Worker<WebsiteFixJobData, WebsiteFixJobResult>(
    QUEUE_NAME,
    async (job) => processWebsiteFixJob(job.data.websiteFixId),
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[FixWorker] Job ${job.id} completed fix=${job.data.websiteFixId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[FixWorker] Job ${job?.id} failed:`, err?.message);
  });

  return worker;
}
