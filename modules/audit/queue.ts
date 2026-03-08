/**
 * Audit job queue (BullMQ). Used when REDIS_URL is set for background processing.
 */

import { Queue } from "bullmq";

const QUEUE_NAME = "website-audit";

export interface AuditJobData {
  url: string;
  email: string;
  name?: string;
  company?: string;
  userId?: string;
}

export interface AuditJobResult {
  reportId: string;
  leadId: string;
}

let queue: Queue<AuditJobData, AuditJobResult> | null = null;

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

/**
 * Get the audit queue. Returns null if Redis is not configured.
 */
export function getAuditQueue(): Queue<AuditJobData, AuditJobResult> | null {
  if (queue) return queue;
  const connection = getConnectionOptions();
  if (!connection) return null;
  try {
    queue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 1000 },
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
      },
    });
    return queue;
  } catch {
    return null;
  }
}

/**
 * Add an audit job. Returns job id or null if queue unavailable.
 */
export async function addAuditJob(data: AuditJobData): Promise<string | null> {
  const q = getAuditQueue();
  if (!q) return null;
  try {
    const job = await q.add("audit", data);
    return typeof job.id === "string" ? job.id : String(job.id ?? "");
  } catch {
    return null;
  }
}

export function isAuditQueueAvailable(): boolean {
  return !!process.env.REDIS_URL?.trim() && !!getAuditQueue();
}
