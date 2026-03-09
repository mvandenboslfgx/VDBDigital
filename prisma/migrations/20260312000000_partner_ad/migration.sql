-- CreateTable
CREATE TABLE "PartnerAd" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "targetMetric" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerAd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerAd_targetMetric_idx" ON "PartnerAd"("targetMetric");

-- CreateIndex
CREATE INDEX "PartnerAd_active_idx" ON "PartnerAd"("active");
