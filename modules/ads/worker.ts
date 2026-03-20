/**
 * BullMQ worker for ad metrics aggregation jobs.
 */

import { Worker } from "bullmq";
import type { AdMetricsJobData } from "./queue";
import { aggregateAdMetrics } from "./process-metrics";

function getConnectionOptions(): import("bullmq").ConnectionOptions {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is required for the ad metrics worker");
  const u = new URL(url);
  return {
    host: u.hostname || "localhost",
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
  };
}

const QUEUE_NAME = "ads-metrics";

export function startAdMetricsWorker(): Worker<AdMetricsJobData, void> {
  const connection = getConnectionOptions();
  const worker = new Worker<AdMetricsJobData, void>(
    QUEUE_NAME,
    async () => {
      await aggregateAdMetrics();
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[AdMetricsWorker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[AdMetricsWorker] Job ${job?.id} failed:`, err?.message);
  });

  return worker;
}

