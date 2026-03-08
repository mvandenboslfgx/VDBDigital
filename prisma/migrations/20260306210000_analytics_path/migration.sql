-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN "path" TEXT;

-- CreateIndex
CREATE INDEX "AnalyticsEvent_path_idx" ON "AnalyticsEvent"("path");
