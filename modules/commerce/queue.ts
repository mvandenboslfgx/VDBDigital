/**
 * BullMQ queue for post-checkout order processing.
 */

import { Queue } from "bullmq";

const QUEUE_NAME = "product-order";

export interface ProductOrderJobData {
  productOrderId: string;
}

let queue: Queue<ProductOrderJobData> | null = null;

function getConnectionOptions(): { host: string; port: number; password?: string } | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    return {
      host: u.hostname || "localhost",
      port: u.port ? parseInt(u.port, 10) : 6379,
      password: u.password || undefined,
    };
  } catch {
    return null;
  }
}

export function getProductOrderQueue(): Queue<ProductOrderJobData> | null {
  if (queue) return queue;
  const connection = getConnectionOptions();
  if (!connection) return null;
  try {
    queue = new Queue<ProductOrderJobData>(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 500 },
      },
    });
    return queue;
  } catch {
    return null;
  }
}

export async function addProductOrderJob(data: ProductOrderJobData): Promise<string | null> {
  const q = getProductOrderQueue();
  if (!q) return null;
  try {
    const job = await q.add("product-order-completed", data, {
      jobId: `product-order-${data.productOrderId}`,
    });
    return typeof job.id === "string" ? job.id : String(job.id ?? "");
  } catch {
    return null;
  }
}
