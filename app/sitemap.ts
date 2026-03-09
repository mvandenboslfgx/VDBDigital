import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";
import { getAllSeoSlugs } from "@/lib/seo-pages";
import { getProgrammaticSlugs } from "@/lib/programmatic-seo";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const now = new Date().toISOString();

  const staticRoutes = [
    { url: base, lastModified: now, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/reviews`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/work`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/process`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/builder`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/audit`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/ai-website-audit`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/ai-copy`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/competitor-analyzer`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/funnel-builder`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/calculators`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/create-account`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/tools`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/kennis`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/kennisbank`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/platform`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/apparaten`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/cart`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/prijzen`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/website-scan`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/gratis-website-scan`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/support`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}/voorwaarden`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}/disclaimer`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const workSlugs = ["de-elektricien"];
  const workEntries = workSlugs.map((slug) => ({
    url: `${base}/work/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const seoSlugs = getAllSeoSlugs();
  const seoEntries: MetadataRoute.Sitemap = seoSlugs.map((slug) => ({
    url: `${base}/seo/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const publishedArticles = await prisma.article.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
    });
    articleEntries = publishedArticles.map((a) => ({
      url: `${base}/kennisbank/${a.slug}`,
      lastModified: a.updatedAt.toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Article table may not exist yet
  }

  const toolSlugs = getProgrammaticSlugs();
  const toolEntries: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
    url: `${base}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  let publicAuditEntries: MetadataRoute.Sitemap = [];
  try {
    const audits = await prisma.publicAudit.findMany({
      take: 500,
      orderBy: { createdAt: "desc" },
      select: { domain: true, createdAt: true },
    });
    publicAuditEntries = audits.map((a) => ({
      url: `${base}/audit/${encodeURIComponent(a.domain)}`,
      lastModified: a.createdAt.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // PublicAudit table may not exist yet
  }

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });
    productEntries = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // Product table may not exist yet
  }

  let reportEntries: MetadataRoute.Sitemap = [];
  try {
    const reports = await prisma.auditReport.findMany({
      where: { shareSlug: { not: null } },
      take: 500,
      orderBy: { createdAt: "desc" },
      select: { shareSlug: true, createdAt: true },
    });
    reportEntries = reports
      .filter((r): r is { shareSlug: string; createdAt: Date } => r.shareSlug != null)
      .map((r) => ({
        url: `${base}/report/${encodeURIComponent(r.shareSlug)}`,
        lastModified: r.createdAt.toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
  } catch {
    // AuditReport table may not exist yet
  }

  return [...staticRoutes, ...workEntries, ...seoEntries, ...articleEntries, ...toolEntries, ...publicAuditEntries, ...productEntries, ...reportEntries];
}
