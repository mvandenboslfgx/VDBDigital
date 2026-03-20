/**
 * BullMQ worker for product-order jobs.
 * Run: npx tsx scripts/run-commerce-worker.ts
 */

import { Worker } from "bullmq";
import type { ProductOrderJobData } from "./queue";
import { processProductOrderJob } from "./process-order-job";

const QUEUE_NAME = "product-order";

function getConnectionOptions(): import("bullmq").ConnectionOptions {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is required for the commerce worker");
  const u = new URL(url);
  return {
    host: u.hostname || "localhost",
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
  };
}

export function startProductOrderWorker(): Worker<ProductOrderJobData, { productOrderId: string }> {
  const connection = getConnectionOptions();
  const worker = new Worker<ProductOrderJobData, { productOrderId: string }>(
    QUEUE_NAME,
    async (job) => processProductOrderJob(job.data.productOrderId),
    {
      connection,
      concurrency: 3,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[CommerceWorker] Job ${job.id} completed order=${job.data.productOrderId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[CommerceWorker] Job ${job?.id} failed:`, err?.message);
  });

  return worker;
}
