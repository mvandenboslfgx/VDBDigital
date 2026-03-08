-- Add technical data and scan confidence to AuditReport for deterministic audit transparency
ALTER TABLE "AuditReport" ADD COLUMN "technicalData" JSONB;
ALTER TABLE "AuditReport" ADD COLUMN "scanConfidence" INTEGER;
