-- CreateTable
CREATE TABLE "AuditReport" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "seoScore" INTEGER NOT NULL,
    "perfScore" INTEGER NOT NULL,
    "uxScore" INTEGER NOT NULL,
    "convScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditReport_leadId_idx" ON "AuditReport"("leadId");
CREATE INDEX "AuditReport_createdAt_idx" ON "AuditReport"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
