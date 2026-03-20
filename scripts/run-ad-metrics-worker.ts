/**
 * Run the ad metrics worker and ensure repeat schedule exists.
 * Use: npm run ads:metrics:worker
 */

import { ensureAdMetricsSchedule } from "../modules/ads/queue";
import { startAdMetricsWorker } from "../modules/ads/worker";

void ensureAdMetricsSchedule();
startAdMetricsWorker();
console.log("[AdMetricsWorker] Started. Waiting for jobs...");

