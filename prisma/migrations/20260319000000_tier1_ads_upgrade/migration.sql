-- Tier-1 Ads upgrade:
-- 1) bid-aware auction field on campaigns
-- 2) pre-aggregated daily metrics table for fast ranking queries

ALTER TABLE "AdCampaign"
ADD COLUMN IF NOT EXISTS "bidCpc" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

CREATE TABLE IF NOT EXISTS "AdMetricsDaily" (
  "id" TEXT NOT NULL,
  "adId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "conversions" INTEGER NOT NULL DEFAULT 0,
  "revenueCents" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AdMetricsDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdMetricsDaily_adId_date_key"
ON "AdMetricsDaily"("adId", "date");

CREATE INDEX IF NOT EXISTS "AdMetricsDaily_adId_date_idx"
ON "AdMetricsDaily"("adId", "date");
