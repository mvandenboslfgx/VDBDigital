-- CreateEnum
CREATE TYPE "WebsiteAuditStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateTable
CREATE TABLE "WebsiteAudit" (
    "id" TEXT NOT NULL,
    "websiteProjectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "WebsiteAuditStatus" NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "errorMessage" TEXT,
    "auditHistoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteAudit_auditHistoryId_key" ON "WebsiteAudit"("auditHistoryId");
CREATE INDEX "WebsiteAudit_websiteProjectId_idx" ON "WebsiteAudit"("websiteProjectId");
CREATE INDEX "WebsiteAudit_status_idx" ON "WebsiteAudit"("status");
CREATE INDEX "WebsiteAudit_createdAt_idx" ON "WebsiteAudit"("createdAt");

-- AddForeignKey
ALTER TABLE "WebsiteAudit" ADD CONSTRAINT "WebsiteAudit_websiteProjectId_fkey" FOREIGN KEY ("websiteProjectId") REFERENCES "WebsiteProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebsiteAudit" ADD CONSTRAINT "WebsiteAudit_auditHistoryId_fkey" FOREIGN KEY ("auditHistoryId") REFERENCES "AuditHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
