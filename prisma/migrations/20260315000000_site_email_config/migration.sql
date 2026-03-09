-- CreateTable
CREATE TABLE "SiteEmailConfig" (
    "id" TEXT NOT NULL,
    "sourceEmail" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteEmailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteEmailConfig_sourceEmail_idx" ON "SiteEmailConfig"("sourceEmail");
