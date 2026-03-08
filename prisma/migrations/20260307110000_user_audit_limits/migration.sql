-- AlterTable
ALTER TABLE "User" ADD COLUMN "auditCountCurrentMonth" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastAuditResetAt" TIMESTAMP(3);
