/**
 * Kennisbank category slugs. Used to distinguish /kennisbank/[slug] category pages from article slugs.
 */

export const CATEGORY_SLUGS = [
  "seo",
  "website-snelheid",
  "conversie",
  "ai-marketing",
  "digitale-strategie",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORY_SLUGS.includes(slug as CategorySlug);
}

export const CATEGORIES: Record<
  string,
  { title: string; description: string; articles: { title: string; excerpt: string; href: string }[] }
> = {
  seo: {
    title: "SEO",
    description: "Zoekmachine-optimalisatie en vindbaarheid.",
    articles: [
      { title: "Wat is SEO en waarom het belangrijk is", excerpt: "Basis van zoekmachine-optimalisatie en hoe het je website helpt.", href: "/tools/website-audit" },
      { title: "Zoekwoorden vinden die converteren", excerpt: "Hoe je de juiste zoekwoorden kiest en zoekintentie herkent.", href: "/tools/seo-keyword-finder" },
    ],
  },
  "website-snelheid": {
    title: "Website snelheid",
    description: "Performance en Core Web Vitals.",
    articles: [
      { title: "Core Web Vitals in het kort", excerpt: "LCP, FID, CLS en wat ze voor je bezoekers betekenen.", href: "/tools/performance-check" },
      { title: "Je website sneller maken", excerpt: "Praktische stappen voor betere laadtijden.", href: "/tools/performance-check" },
    ],
  },
  conversie: {
    title: "Conversie optimalisatie",
    description: "Van bezoeker naar klant.",
    articles: [
      { title: "CTA's die werken", excerpt: "Hoe je duidelijke calls-to-action ontwerpt.", href: "/tools/conversion-analyzer" },
      { title: "Vertrouwen opbouwen op je site", excerpt: "Social proof, garanties en transparantie.", href: "/tools/conversion-analyzer" },
    ],
  },
  "ai-marketing": {
    title: "AI marketing",
    description: "AI inzetten voor copy en strategie.",
    articles: [
      { title: "AI voor betere copy", excerpt: "Wanneer en hoe AI je teksten versterkt.", href: "/tools/copy-optimizer" },
      { title: "Marketingstrategie met AI", excerpt: "Een strategie op maat laten genereren.", href: "/tools/marketing-strategy" },
    ],
  },
  "digitale-strategie": {
    title: "Digitale strategie",
    description: "Doelen en roadmap.",
    articles: [
      { title: "Digitale doelen stellen", excerpt: "SMART-doelen voor je website en marketing.", href: "/tools/marketing-strategy" },
      { title: "Start met een website-audit", excerpt: "Inzicht in waar je staat voordat je gaat verbeteren.", href: "/website-scan" },
    ],
  },
};
