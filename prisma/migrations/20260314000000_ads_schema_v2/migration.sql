-- CreateEnum
CREATE TYPE "AdTargetMetric" AS ENUM ('SEO', 'PERF', 'UX', 'CONV');

-- AlterTable AdCampaign: Int -> Float
ALTER TABLE "AdCampaign" RENAME COLUMN "budget" TO "totalBudget";
ALTER TABLE "AdCampaign" ALTER COLUMN "totalBudget" TYPE DOUBLE PRECISION USING ("totalBudget"::double precision);
ALTER TABLE "AdCampaign" ALTER COLUMN "spent" TYPE DOUBLE PRECISION USING ("spent"::double precision);
ALTER TABLE "AdCampaign" ALTER COLUMN "cpc" TYPE DOUBLE PRECISION USING ("cpc"::double precision);

-- PartnerAd: add ctaText, url, image, clicks
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "ctaText" TEXT NOT NULL DEFAULT 'Bekijk aanbieding';
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "url" TEXT;
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "clicks" INTEGER NOT NULL DEFAULT 0;

-- Copy from old columns
UPDATE "PartnerAd" SET "url" = "affiliateUrl" WHERE "affiliateUrl" IS NOT NULL;
UPDATE "PartnerAd" SET "image" = "bannerImage" WHERE "bannerImage" IS NOT NULL;
UPDATE "PartnerAd" SET "clicks" = "clickCount" WHERE "clickCount" IS NOT NULL;

-- Drop old columns
ALTER TABLE "PartnerAd" DROP COLUMN IF EXISTS "affiliateUrl";
ALTER TABLE "PartnerAd" DROP COLUMN IF EXISTS "bannerImage";
ALTER TABLE "PartnerAd" DROP COLUMN IF EXISTS "clickCount";
ALTER TABLE "PartnerAd" DROP COLUMN IF EXISTS "companyName";

-- url NOT NULL
UPDATE "PartnerAd" SET "url" = '' WHERE "url" IS NULL;
ALTER TABLE "PartnerAd" ALTER COLUMN "url" SET NOT NULL;

-- targetMetric: text -> enum (add new column, backfill, drop old, rename)
ALTER TABLE "PartnerAd" ADD COLUMN "targetMetricNew" "AdTargetMetric";
UPDATE "PartnerAd" SET "targetMetricNew" = CASE
  WHEN "targetMetric" = 'SEO' THEN 'SEO'::"AdTargetMetric"
  WHEN "targetMetric" IN ('Performance', 'PERF') THEN 'PERF'::"AdTargetMetric"
  WHEN "targetMetric" = 'UX' THEN 'UX'::"AdTargetMetric"
  WHEN "targetMetric" IN ('Conversion', 'CONV') THEN 'CONV'::"AdTargetMetric"
  ELSE 'SEO'::"AdTargetMetric"
END;
ALTER TABLE "PartnerAd" DROP COLUMN "targetMetric";
ALTER TABLE "PartnerAd" RENAME COLUMN "targetMetricNew" TO "targetMetric";
ALTER TABLE "PartnerAd" ALTER COLUMN "targetMetric" SET NOT NULL;
