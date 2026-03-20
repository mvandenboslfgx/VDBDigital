/**
 * BullMQ worker for website audit jobs. Run in a separate process:
 *   npx tsx modules/audit/worker.ts
 * Or: node --import tsx modules/audit/worker.ts
 * Requires REDIS_URL.
 */

import { Worker } from "bullmq";
import { processAuditJob } from "./process-audit";
import type { AuditJobData, AuditJobResult } from "./queue";

function getConnectionOptions(): import("bullmq").ConnectionOptions {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is required for the audit worker");
  const u = new URL(url);
  return {
    host: u.hostname || "localhost",
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
  };
}

const QUEUE_NAME = "website-audit";

export function startAuditWorker(): Worker<AuditJobData, AuditJobResult> {
  const connection = getConnectionOptions();
  const worker = new Worker<AuditJobData, AuditJobResult>(
    QUEUE_NAME,
    async (job) => processAuditJob(job),
    {
      connection,
      concurrency: 3,
    }
  );

  worker.on("completed", (job, result) => {
    const ref = result.websiteAuditId ?? result.reportId ?? "?";
    console.log(`[AuditWorker] Job ${job.id} completed, ref=${ref}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[AuditWorker] Job ${job?.id} failed:`, err?.message);
  });

  return worker;
}
