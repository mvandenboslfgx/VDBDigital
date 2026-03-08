import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { notFound } from "next/navigation";

const CATEGORIES: Record<
  string,
  { title: string; description: string; articles: { slug: string; title: string; excerpt: string; href: string }[] }
> = {
  seo: {
    title: "SEO",
    description: "Zoekmachine-optimalisatie en vindbaarheid.",
    articles: [
      { slug: "wat-is-seo", title: "Wat is SEO en waarom het belangrijk is", excerpt: "Basis van zoekmachine-optimalisatie en hoe het je website helpt.", href: "/kennis/seo#wat-is-seo" },
      { slug: "zoekwoorden", title: "Zoekwoorden vinden die converteren", excerpt: "Hoe je de juiste zoekwoorden kiest en zoekintentie herkent.", href: "/tools/seo-keyword-finder" },
    ],
  },
  "website-snelheid": {
    title: "Website snelheid",
    description: "Performance en Core Web Vitals.",
    articles: [
      { slug: "core-web-vitals", title: "Core Web Vitals in het kort", excerpt: "LCP, FID, CLS en wat ze voor je bezoekers betekenen.", href: "/kennis/website-snelheid#core-web-vitals" },
      { slug: "sneller-maken", title: "Je website sneller maken", excerpt: "Praktische stappen voor betere laadtijden.", href: "/tools/performance-check" },
    ],
  },
  "conversie-optimalisatie": {
    title: "Conversie optimalisatie",
    description: "Van bezoeker naar klant.",
    articles: [
      { slug: "cta-optimalisatie", title: "CTA's die werken", excerpt: "Hoe je duidelijke calls-to-action ontwerpt.", href: "/tools/conversion-analyzer" },
      { slug: "vertrouwen", title: "Vertrouwen opbouwen op je site", excerpt: "Social proof, garanties en transparantie.", href: "/kennis/conversie-optimalisatie#vertrouwen" },
    ],
  },
  "ai-marketing": {
    title: "AI marketing",
    description: "AI inzetten voor copy en strategie.",
    articles: [
      { slug: "ai-copy", title: "AI voor betere copy", excerpt: "Wanneer en hoe AI je teksten versterkt.", href: "/tools/copy-optimizer" },
      { slug: "marketingstrategie", title: "Marketingstrategie met AI", excerpt: "Een strategie op maat laten genereren.", href: "/tools/marketing-strategy" },
    ],
  },
  "digitale-strategie": {
    title: "Digitale strategie",
    description: "Doelen en roadmap.",
    articles: [
      { slug: "doelen", title: "Digitale doelen stellen", excerpt: "SMART-doelen voor je website en marketing.", href: "/kennis/digitale-strategie#doelen" },
      { slug: "audit", title: "Start met een website-audit", excerpt: "Inzicht in waar je staat voordat je gaat verbeteren.", href: "/website-scan" },
    ],
  },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const data = CATEGORIES[category];
  if (!data) return { title: "Categorie | Kennisbank | VDB Digital" };
  return {
    title: `${data.title} | Kennisbank | VDB Digital`,
    description: data.description,
  };
}

export default async function KennisCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const data = CATEGORIES[category];
  if (!data) notFound();

  return (
    <SiteShell>
      <div className="section-container py-16 md:py-24">
        <Link
          href="/kennis"
          className="text-sm font-medium text-marketing-textSecondary transition-colors hover:text-marketing-text"
        >
          ← Kennisbank
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
          {data.title}
        </h1>
        <p className="mt-2 text-marketing-textSecondary">{data.description}</p>

        <p className="mt-6">
          <Link href="/seo/website-analyse" className="text-gold hover:text-goldHover hover:underline">
            Website analyse uitleg
          </Link>
          {" · "}
          <Link href="/tools" className="text-gold hover:text-goldHover hover:underline">
            Alle tools
          </Link>
        </p>

        <div className="mt-12 space-y-6">
          {data.articles.map((article) => (
            <Link
              key={article.slug}
              href={article.href}
              className="block rounded-2xl border border-marketing-border bg-white p-6 shadow-marketing-card transition-shadow hover:border-gold/30 hover:shadow-marketing-card-hover"
            >
              <h2 className="text-lg font-semibold text-marketing-text">{article.title}</h2>
              <p className="mt-2 text-sm text-marketing-textSecondary">{article.excerpt}</p>
              <span className="mt-3 inline-block text-sm font-medium text-gold">
                Lees meer →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
