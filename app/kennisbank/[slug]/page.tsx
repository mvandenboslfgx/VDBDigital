import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { CATEGORY_SLUGS, CATEGORIES, isCategorySlug } from "@/lib/kennisbank-categories";
import { ArticleLayout } from "@/components/kennisbank/ArticleLayout";
import { siteUrl } from "@/lib/metadata";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const categoryParams = CATEGORY_SLUGS.map((slug) => ({ slug }));
  let articleParams: { slug: string }[] = [];
  try {
    const articles = await prisma.article.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
    });
    articleParams = articles.map((a) => ({ slug: a.slug }));
  } catch {
    // Article table may not exist yet (e.g. fresh deploy); static params = categories only
  }
  return [...categoryParams, ...articleParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isCategorySlug(slug)) {
    const data = CATEGORIES[slug];
    return pageMetadata({
      title: `${data.title} | Kennisbank`,
      description: data.description,
      path: `/kennisbank/${slug}`,
    });
  }
  let article: { title: string; seoTitle: string | null; seoDescription: string | null } | null = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug, publishedAt: { not: null } },
      select: { title: true, seoTitle: true, seoDescription: true },
    });
  } catch {
    // Article table may not exist yet
  }
  if (!article) return {};
  return pageMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.title.slice(0, 160) || "Artikel uit de Kennisbank van VDB Digital.",
    path: `/kennisbank/${slug}`,
  });
}

export default async function KennisbankSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isCategorySlug(slug)) {
    const data = CATEGORIES[slug];
    return (
      <SiteShell>
        <div className="section-container py-24 md:py-32">
          <Link
            href="/kennisbank"
            className="text-sm font-medium text-marketing-textSecondary hover:text-marketing-text transition-colors"
          >
            ← Kennisbank
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
            {data.title}
          </h1>
          <p className="mt-2 text-lg text-marketing-textSecondary">{data.description}</p>
          <p className="mt-6">
            <Link href="/tools" className="text-gold hover:text-goldHover hover:underline">
              Alle tools
            </Link>
          </p>
          <div className="mt-12 space-y-6">
            {data.articles.map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="block rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-gold/30 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-marketing-text">{article.title}</h2>
                <p className="mt-2 text-lg text-marketing-textSecondary">{article.excerpt}</p>
                <span className="mt-4 inline-block text-sm font-medium text-gold">Lees meer →</span>
              </Link>
            ))}
          </div>
        </div>
      </SiteShell>
    );
  }

  let article: Awaited<ReturnType<typeof prisma.article.findUnique>> = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug },
    });
  } catch {
    // Article table may not exist yet
  }
  if (!article || !article.publishedAt) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle || article.title,
    description: article.seoDescription || undefined,
    author: { "@type": "Organization", name: article.author },
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    url: `${siteUrl}/kennisbank/${article.slug}`,
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleLayout
        title={article.title}
        content={article.content}
        author={article.author}
        publishedAt={article.publishedAt}
      />
    </SiteShell>
  );
}
