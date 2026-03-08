/**
 * Run the audit queue worker. Use: npm run audit:worker
 * Requires REDIS_URL and DATABASE_URL.
 */

import { startAuditWorker } from "../modules/audit/worker";

startAuditWorker();
console.log("[AuditWorker] Started. Waiting for jobs...");
