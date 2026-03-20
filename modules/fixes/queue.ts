/**
 * BullMQ queue for Website Fix Engine jobs (preview generation).
 */

import { Queue } from "bullmq";

const QUEUE_NAME = "website-fix";

export interface WebsiteFixJobData {
  websiteFixId: string;
}

export interface WebsiteFixJobResult {
  websiteFixId: string;
}

let queue: Queue<WebsiteFixJobData, WebsiteFixJobResult> | null = null;

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

export function getWebsiteFixQueue(): Queue<WebsiteFixJobData, WebsiteFixJobResult> | null {
  if (queue) return queue;
  const connection = getConnectionOptions();
  if (!connection) return null;
  try {
    queue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 500 },
        // Worker retries re-run the same job record — not a new queue.add(). jobId below only
        // dedupes duplicate enqueue calls for the same websiteFixId.
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
      },
    });
    return queue;
  } catch {
    return null;
  }
}

export async function addWebsiteFixJob(data: WebsiteFixJobData): Promise<string | null> {
  const q = getWebsiteFixQueue();
  if (!q) return null;
  try {
    const job = await q.add("fix", data, {
      jobId: `website-fix-${data.websiteFixId}`, // dedupe duplicate add(); retries use attempts/backoff above
    });
    return typeof job.id === "string" ? job.id : String(job.id ?? "");
  } catch {
    return null;
  }
}

export function isWebsiteFixQueueAvailable(): boolean {
  return !!process.env.REDIS_URL?.trim() && !!getWebsiteFixQueue();
}
