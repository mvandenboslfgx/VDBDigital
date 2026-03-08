-- CreateTable
CREATE TABLE "LeadScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "seoScore" INTEGER NOT NULL,
    "perfScore" INTEGER NOT NULL,
    "uxScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "seoScore" INTEGER NOT NULL,
    "perfScore" INTEGER NOT NULL,
    "uxScore" INTEGER NOT NULL,
    "convScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "auditReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AuditHistory_auditReportId_key" ON "AuditHistory"("auditReportId");

-- CreateIndex
CREATE INDEX "LeadScore_userId_idx" ON "LeadScore"("userId");
-- CreateIndex
CREATE INDEX "LeadScore_createdAt_idx" ON "LeadScore"("createdAt");

-- CreateIndex
CREATE INDEX "AuditHistory_userId_idx" ON "AuditHistory"("userId");
-- CreateIndex
CREATE INDEX "AuditHistory_createdAt_idx" ON "AuditHistory"("createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_userId_idx" ON "UsageEvent"("userId");
-- CreateIndex
CREATE INDEX "UsageEvent_event_idx" ON "UsageEvent"("event");
-- CreateIndex
CREATE INDEX "UsageEvent_createdAt_idx" ON "UsageEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "LeadScore" ADD CONSTRAINT "LeadScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditHistory" ADD CONSTRAINT "AuditHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
