/**
 * Ad metrics aggregation queue (BullMQ).
 * Requires REDIS_URL.
 */

import { Queue } from "bullmq";

const QUEUE_NAME = "ads-metrics";

export interface AdMetricsJobData {
  // Reserved for future shard/window options.
  kind?: "aggregate";
}

let queue: Queue<AdMetricsJobData> | null = null;

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

export function getAdMetricsQueue(): Queue<AdMetricsJobData> | null {
  if (queue) return queue;
  const connection = getConnectionOptions();
  if (!connection) return null;
  try {
    queue = new Queue<AdMetricsJobData>(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 500 },
        attempts: 2,
        backoff: { type: "exponential", delay: 2000 },
      },
    });
    return queue;
  } catch {
    return null;
  }
}

export async function ensureAdMetricsSchedule(): Promise<boolean> {
  const q = getAdMetricsQueue();
  if (!q) return false;
  try {
    await q.add(
      "aggregate-ads",
      { kind: "aggregate" },
      {
        repeat: { every: 10_000 },
        jobId: "aggregate-ads-repeat",
      }
    );
    return true;
  } catch {
    return false;
  }
}

