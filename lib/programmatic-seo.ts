/**
 * Programmatic SEO tool pages: /tools/[slug]
 * Used by generateStaticParams and the dynamic tool page.
 */

export interface ProgrammaticToolPage {
  slug: string;
  title: string;
  description: string;
  benefits: string[];
  howItWorks: string[];
}

export const programmaticPages: ProgrammaticToolPage[] = [
  {
    slug: "seo-analyse",
    title: "Gratis SEO analyse",
    description:
      "Controleer gratis de SEO van uw website met AI en ontvang direct verbeterpunten.",
    benefits: [
      "Controle van titel, meta en koppenstructuur",
      "Technische SEO-inzicht",
      "Concrete aanbevelingen voor betere vindbaarheid",
      "Resultaat binnen een minuut",
    ],
    howItWorks: [
      "Voer uw website-URL in",
      "Onze tool analyseert uw pagina op SEO-criteria",
      "Ontvang een score en een overzicht van verbeterpunten",
      "Pas uw site aan en meet opnieuw",
    ],
  },
  {
    slug: "seo-check",
    title: "Gratis SEO check",
    description:
      "Controleer gratis de SEO van uw website met AI en ontvang direct verbeterpunten.",
    benefits: [
      "Controle van titel, meta en koppenstructuur",
      "Technische SEO-inzicht",
      "Concrete aanbevelingen voor betere vindbaarheid",
      "Resultaat binnen een minuut",
    ],
    howItWorks: [
      "Voer uw website-URL in",
      "Onze tool analyseert uw pagina op SEO-criteria",
      "Ontvang een score en een overzicht van verbeterpunten",
      "Pas uw site aan en meet opnieuw",
    ],
  },
  {
    slug: "website-analyse",
    title: "Gratis website analyse",
    description:
      "Analyseer uw website op snelheid, SEO en conversie met onze AI-tool.",
    benefits: [
      "Scores voor SEO, snelheid, UX en conversie",
      "Eén overzicht met prioriteiten",
      "Geen technische kennis nodig",
      "Direct toepasbare verbeterpunten",
    ],
    howItWorks: [
      "Vul uw website-URL in op de scanpagina",
      "De analyse draait automatisch (crawl, performance, scoring)",
      "U ontvangt een rapport met scores en aanbevelingen",
      "Gebruik het rapport om stap voor stap te optimaliseren",
    ],
  },
  {
    slug: "conversie-analyse",
    title: "Website conversie analyse",
    description:
      "Ontdek waarom uw website bezoekers niet converteert naar klanten.",
    benefits: [
      "Analyse van CTA's, formulieren en paginastructuur",
      "Advies voor meer vertrouwen en duidelijkheid",
      "Focus op acties die tot conversie leiden",
      "Inzicht in de gebruikersreis",
    ],
    howItWorks: [
      "Start een website-scan met uw URL",
      "De tool beoordeelt conversie-elementen (CTA's, formulieren, flow)",
      "U krijgt een conversiescore en verbeterpunten",
      "Pas de aanbevelingen toe en meet opnieuw",
    ],
  },
  {
    slug: "snelheid-test",
    title: "Website snelheid test",
    description:
      "Test de laadsnelheid van uw website en ontvang tips om te versnellen.",
    benefits: [
      "Meting van Core Web Vitals (LCP, INP, CLS)",
      "Praktische tips om uw site te versnellen",
      "Betere gebruikerservaring en lagere bounce",
      "Positief effect op zoekmachine rankings",
    ],
    howItWorks: [
      "Voer uw URL in bij de website-scan",
      "Performance wordt automatisch gemeten",
      "U ziet scores en aanbevelingen voor snelheid",
      "Optimaliseer afbeeldingen, caching en scripts op basis van het rapport",
    ],
  },
  {
    slug: "seo-analyse-webshop",
    title: "SEO analyse voor webshops",
    description:
      "Gratis SEO-check voor uw webshop. Verbeter vindbaarheid en conversie met onze AI-analyse.",
    benefits: [
      "SEO-audit afgestemd op webshops",
      "Productpagina's en categorieën",
      "Technische SEO voor e-commerce",
      "Direct toepasbare verbeterpunten",
    ],
    howItWorks: [
      "Voer de URL van uw webshop in",
      "De tool analyseert structuur, meta en content",
      "Ontvang scores en aanbevelingen voor webshops",
      "Pas aan en meet opnieuw voor betere rankings",
    ],
  },
  {
    slug: "seo-analyse-wordpress",
    title: "SEO analyse voor WordPress",
    description:
      "Controleer de SEO van uw WordPress-site. Ontvang concrete tips voor betere vindbaarheid.",
    benefits: [
      "WordPress-specifieke SEO-checks",
      "Pagina- en berichtstructuur",
      "Plug-in en theme impact",
      "Praktische verbeterpunten",
    ],
    howItWorks: [
      "Vul uw WordPress-site-URL in",
      "De analyse scant titels, meta en structuur",
      "U krijgt een overzicht van verbeterpunten",
      "Implementeer aanbevelingen in WordPress",
    ],
  },
  {
    slug: "seo-analyse-shopify",
    title: "SEO analyse voor Shopify",
    description:
      "SEO-audit voor uw Shopify webshop. Verbeter zoekmachineposities en verkoop.",
    benefits: [
      "Shopify-specifieke SEO-inzichten",
      "Product- en collectiepagina's",
      "Technische en content-aanbevelingen",
      "Snelle implementatie in Shopify",
    ],
    howItWorks: [
      "Voer uw Shopify-store-URL in",
      "De tool analyseert uw winkel",
      "Ontvang een rapport met prioriteiten",
      "Pas titels, meta en content aan in Shopify",
    ],
  },
  {
    slug: "seo-analyse-saas",
    title: "SEO analyse voor SaaS",
    description:
      "SEO-check voor SaaS-websites. Optimaliseer landing pages en conversie voor software.",
    benefits: [
      "SaaS- en landingpage-focus",
      "Conversie- en signup-optimalisatie",
      "Technische en content-SEO",
      "Aanbevelingen voor softwarebedrijven",
    ],
    howItWorks: [
      "Vul de URL van uw SaaS-site in",
      "De analyse beoordeelt structuur en content",
      "U ontvangt scores en verbeterpunten",
      "Optimaliseer voor zoekmachines en conversie",
    ],
  },
  {
    slug: "seo-analyse-bedrijf",
    title: "SEO analyse voor bedrijven",
    description:
      "Gratis website-SEO-check voor ondernemers. Ontdek waarom uw bedrijfssite niet goed vindbaar is.",
    benefits: [
      "SEO-audit voor bedrijfswebsites",
      "Diensten- en contactpagina's",
      "Lokale en algemene vindbaarheid",
      "Concrete stappen voor verbetering",
    ],
    howItWorks: [
      "Voer uw bedrijfswebsite-URL in",
      "De tool analyseert uw site op SEO",
      "Ontvang een overzicht met prioriteiten",
      "Verbeter titels, meta en content stap voor stap",
    ],
  },
];

export function getProgrammaticSlugs(): string[] {
  return programmaticPages.map((p) => p.slug);
}

export function getProgrammaticPage(slug: string): ProgrammaticToolPage | null {
  return programmaticPages.find((p) => p.slug === slug) ?? null;
}
