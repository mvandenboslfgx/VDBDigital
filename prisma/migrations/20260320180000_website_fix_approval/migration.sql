-- AlterTable
ALTER TABLE "WebsiteFix" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WebsiteFix" ADD COLUMN "approvedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "WebsiteFix_approved_idx" ON "WebsiteFix"("approved");
