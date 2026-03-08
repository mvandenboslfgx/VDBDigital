-- WebsiteProject: user's websites (domain tracking)
CREATE TABLE IF NOT EXISTS "WebsiteProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebsiteProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WebsiteProject_userId_domain_key" ON "WebsiteProject"("userId", "domain");
CREATE INDEX IF NOT EXISTS "WebsiteProject_userId_idx" ON "WebsiteProject"("userId");

ALTER TABLE "WebsiteProject" ADD CONSTRAINT "WebsiteProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AuditReport: shareSlug and improvements
ALTER TABLE "AuditReport" ADD COLUMN IF NOT EXISTS "shareSlug" TEXT;
ALTER TABLE "AuditReport" ADD COLUMN IF NOT EXISTS "improvements" JSONB DEFAULT '[]';
CREATE UNIQUE INDEX IF NOT EXISTS "AuditReport_shareSlug_key" ON "AuditReport"("shareSlug") WHERE "shareSlug" IS NOT NULL;

-- AuditHistory: websiteProjectId and improvements
ALTER TABLE "AuditHistory" ADD COLUMN IF NOT EXISTS "websiteProjectId" TEXT;
ALTER TABLE "AuditHistory" ADD COLUMN IF NOT EXISTS "improvements" JSONB DEFAULT '[]';
CREATE INDEX IF NOT EXISTS "AuditHistory_websiteProjectId_idx" ON "AuditHistory"("websiteProjectId");
ALTER TABLE "AuditHistory" ADD CONSTRAINT "AuditHistory_websiteProjectId_fkey" FOREIGN KEY ("websiteProjectId") REFERENCES "WebsiteProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- User: onboardingStep
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER NOT NULL DEFAULT 0;

-- AgencyBranding
CREATE TABLE IF NOT EXISTS "AgencyBranding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "companyName" TEXT,
    "primaryColor" TEXT DEFAULT '#C6A95D',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgencyBranding_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AgencyBranding_userId_key" ON "AgencyBranding"("userId");
ALTER TABLE "AgencyBranding" ADD CONSTRAINT "AgencyBranding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Team, TeamMember, TeamInvite
CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Team_ownerId_idx" ON "Team"("ownerId");
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "TeamInvite" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamInvite_token_key" ON "TeamInvite"("token");
CREATE INDEX IF NOT EXISTS "TeamInvite_teamId_idx" ON "TeamInvite"("teamId");
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
