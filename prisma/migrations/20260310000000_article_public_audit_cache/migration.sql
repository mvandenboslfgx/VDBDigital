-- CreateTable: Article (kennisbank)
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "author" TEXT NOT NULL DEFAULT 'VDB Digital',
    "seoTitle" TEXT,
    "seoDescription" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AuditCache (audit result cache)
CREATE TABLE "AuditCache" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PublicAudit (public audit pages for SEO)
CREATE TABLE "PublicAudit" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_slug_idx" ON "Article"("slug");
CREATE INDEX "Article_category_idx" ON "Article"("category");
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

CREATE UNIQUE INDEX "AuditCache_url_key" ON "AuditCache"("url");
CREATE INDEX "AuditCache_createdAt_idx" ON "AuditCache"("createdAt");

CREATE UNIQUE INDEX "PublicAudit_domain_key" ON "PublicAudit"("domain");
CREATE INDEX "PublicAudit_domain_idx" ON "PublicAudit"("domain");
CREATE INDEX "PublicAudit_createdAt_idx" ON "PublicAudit"("createdAt");
