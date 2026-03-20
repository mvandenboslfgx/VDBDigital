-- Apply Engine v1: export trail + structured result (no live CMS mutation)
ALTER TABLE "WebsiteFix" ADD COLUMN "applied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WebsiteFix" ADD COLUMN "appliedAt" TIMESTAMP(3);
ALTER TABLE "WebsiteFix" ADD COLUMN "applyResult" JSONB;

CREATE INDEX "WebsiteFix_applied_idx" ON "WebsiteFix"("applied");
