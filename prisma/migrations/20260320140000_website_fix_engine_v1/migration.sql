-- CreateEnum
CREATE TYPE "WebsiteFixStatus" AS ENUM ('pending', 'processing', 'preview_ready', 'failed');

-- CreateTable
CREATE TABLE "WebsiteFix" (
    "id" TEXT NOT NULL,
    "websiteAuditId" TEXT NOT NULL,
    "sourceIssueId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'meta_h1_v1',
    "status" "WebsiteFixStatus" NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteFix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteFix_websiteAuditId_idx" ON "WebsiteFix"("websiteAuditId");
CREATE INDEX "WebsiteFix_websiteAuditId_sourceIssueId_idx" ON "WebsiteFix"("websiteAuditId", "sourceIssueId");

-- AddForeignKey
ALTER TABLE "WebsiteFix" ADD CONSTRAINT "WebsiteFix_websiteAuditId_fkey" FOREIGN KEY ("websiteAuditId") REFERENCES "WebsiteAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
