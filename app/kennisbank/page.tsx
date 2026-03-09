import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  { slug: "seo", title: "SEO", description: "Zoekmachine-optimalisatie, zoekwoorden, technische SEO en content voor betere vindbaarheid.", href: "/kennisbank/seo" },
  { slug: "website-snelheid", title: "Website snelheid", description: "Core Web Vitals, performance-tips en snellere laadtijden voor betere gebruikerservaring.", href: "/kennisbank/website-snelheid" },
  { slug: "conversie", title: "Conversie optimalisatie", description: "CTA's, formulieren, vertrouwen en paginastructuur die bezoekers tot actie brengen.", href: "/kennisbank/conversie" },
  { slug: "ai-marketing", title: "AI marketing", description: "Hoe je AI inzet voor copy, zoekwoorden, analyses en strategie zonder kwaliteit in te leveren.", href: "/kennisbank/ai-marketing" },
  { slug: "digitale-strategie", title: "Digitale strategie", description: "Doelen stellen, kanalen kiezen en een heldere digitale roadmap voor je bedrijf.", href: "/kennisbank/digitale-strategie" },
];

export const metadata = pageMetadata({
  title: "Kennisbank",
  description: "Artikelen over SEO, website snelheid, conversie-optimalisatie, AI marketing en digitale strategie. Duidelijke uitleg en actietips.",
  path: "/kennisbank",
});

export default async function KennisbankPage() {
  let recentArticles: { slug: string; title: string; seoDescription: string | null; publishedAt: Date | null }[] = [];
  try {
    recentArticles = await prisma.article.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: { slug: true, title: true, seoDescription: true, publishedAt: true },
    });
  } catch {
    // Article table may not exist yet (e.g. before migration)
  }

  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-marketing-text md:text-5xl">
            Kennisbank
          </h1>
          <p className="mt-6 text-lg text-marketing-textSecondary">
            Duidelijke uitleg over SEO, snelheid, conversie en AI. Met voorbeelden en een directe link naar onze tools.
          </p>
        </div>
        <div className="mx-auto mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group rounded-2xl border border-slate-200 bg-surface p-8 shadow-sm transition-all hover:border-gold/30 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-marketing-text group-hover:text-gold transition-colors">
                {cat.title}
              </h2>
              <p className="mt-3 text-lg text-marketing-textSecondary">
                {cat.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-gold">Artikelen bekijken →</span>
            </Link>
          ))}
        </div>
        {recentArticles.length > 0 && (
          <div className="mx-auto mt-20">
            <h2 className="text-2xl font-semibold text-marketing-text">Recente artikelen</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/kennisbank/${a.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm transition-all hover:border-gold/30 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-marketing-text group-hover:text-gold transition-colors">
                    {a.title}
                  </h3>
                  {a.seoDescription && (
                    <p className="mt-2 line-clamp-2 text-sm text-marketing-textSecondary">
                      {a.seoDescription}
                    </p>
                  )}
                  {a.publishedAt && (
                    <time className="mt-2 block text-xs text-marketing-textSecondary" dateTime={a.publishedAt.toISOString()}>
                      {new Date(a.publishedAt).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}
                    </time>
                  )}
                  <span className="mt-3 inline-block text-sm font-medium text-gold">Lees meer →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-12 text-center">
          <Link href="/tools" className="text-gold font-medium hover:text-goldHover transition-colors">
            Bekijk alle tools →
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
