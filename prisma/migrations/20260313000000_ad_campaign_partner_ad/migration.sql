-- CreateTable AdCampaign
CREATE TABLE "AdCampaign" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "spent" INTEGER NOT NULL DEFAULT 0,
    "cpc" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

-- Add columns to PartnerAd
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "bannerImage" TEXT;
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "campaignId" TEXT;
ALTER TABLE "PartnerAd" ADD COLUMN IF NOT EXISTS "clickCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdCampaign_active_idx" ON "AdCampaign"("active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PartnerAd_campaignId_idx" ON "PartnerAd"("campaignId");

-- AddForeignKey
ALTER TABLE "PartnerAd" ADD CONSTRAINT "PartnerAd_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
