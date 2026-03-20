/**
 * Programmatic SEO engine – central config for all /seo/[slug] pages.
 * Add new slugs here to generate new static pages automatically.
 */

const SITE_URL = "https://www.vdbdigital.nl";

export type SeoPageConfig = {
  title: string;
  description: string;
  intro: string;
  benefits: string[];
  exampleAnalysis: string;
  faqs: { question: string; answer: string }[];
  /** Optional city name for location pages */
  city?: string;
  /** Optional extra internal links for growth (platform-specific cross-linking) */
  relatedLinks?: { label: string; href: string }[];
};

/** Base content per category; city pages override intro/title/description */
const WEBSITE_ANALYSE_BASE: SeoPageConfig = {
  title: "Website analyse",
  description:
    "Gratis website analyse: ontdek hoe je site scoort op SEO, snelheid, UX en conversie. Direct verbeterpunten en actie-adviezen.",
  intro:
    "Een website analyse geeft inzicht in hoe goed je site presteert op vindbaarheid (SEO), snelheid, gebruiksvriendelijkheid (UX) en conversie. Met een gestructureerde audit krijg je scores per onderdeel en concrete verbeterpunten. Ideaal om prioriteiten te bepalen en stap voor stap je website te optimaliseren.",
  benefits: [
    "Inzicht in SEO-, performance-, UX- en conversiescores",
    "Concrete verbeterpunten met prioriteit",
    "Resultaat binnen circa 60 seconden",
    "Geen technische voorkennis nodig",
  ],
  exampleAnalysis:
    "Een typische analyse toont scores voor SEO (meta, koppen, zoekwoorden), performance (laadtijd, Core Web Vitals), UX (navigatie, leesbaarheid) en conversie (CTA's, formulieren). Per onderdeel krijg je aanbevelingen, bijvoorbeeld: verbeter je meta title, optimaliseer afbeeldingen of versnel je server.",
  faqs: [
    {
      question: "Hoe werkt een gratis website analyse?",
      answer:
        "Je voert je website-URL in op onze scan-pagina. Onze tool analyseert je site en berekent scores voor SEO, snelheid, UX en conversie. Binnen ongeveer 60 seconden ontvang je een overzicht met verbeterpunten.",
    },
    {
      question: "Is een website analyse gratis?",
      answer:
        "Ja. Je kunt één gratis website analyse per maand uitvoeren. Voor meer scans en uitgebreidere rapporten bieden we betaalde abonnementen aan.",
    },
    {
      question: "Wat wordt er geanalyseerd?",
      answer:
        "We analyseren zoekmachine-optimalisatie (titels, meta, koppen), technische performance (laadtijd, Core Web Vitals), gebruiksvriendelijkheid en conversie-elementen zoals calls-to-action en formulieren.",
    },
  ],
};

const SEO_CHECK_BASE: SeoPageConfig = {
  title: "SEO check",
  description:
    "Gratis SEO check voor je website. Controleer titels, meta, koppen en technische SEO. Ontvang direct verbeterpunten.",
  intro:
    "Een SEO check beoordeelt de zoekmachine-optimalisatie van je site: titel en meta description, gebruik van koppen (H1, H2), alt-teksten bij afbeeldingen, canonicals en gestructureerde data. Een goede SEO check geeft je een score en concrete actiepunten om hoger in Google te ranken.",
  benefits: [
    "Controle van titel, meta description en koppenstructuur",
    "Inzicht in technische SEO (canonicals, structured data)",
    "Aanbevelingen voor betere vindbaarheid",
    "Snel resultaat, geen installatie nodig",
  ],
  exampleAnalysis:
    "De SEO-check beoordeelt onder meer je H1-gebruik, meta title en description, alt-teksten en interne linkstructuur. Je krijgt een score en per onderdeel verbeterpunten, zoals: zorg voor een unieke meta description per pagina of voeg ontbrekende alt-teksten toe.",
  faqs: [
    {
      question: "Wat is een SEO check?",
      answer:
        "Een SEO check is een controle van de zoekmachine-optimalisatie van je website. We kijken naar titels, meta's, koppen, afbeeldingen en technische aspecten die je vindbaarheid beïnvloeden.",
    },
    {
      question: "Kan ik gratis een SEO check doen?",
      answer:
        "Ja. Via onze website-scan voer je gratis een SEO-check uit. Je ontvangt een score en verbeterpunten. Voor herhaalde of uitgebreidere analyses zijn er betaalde opties.",
    },
  ],
};

const WEBSITE_SNELHEID_BASE: SeoPageConfig = {
  title: "Website snelheid",
  description:
    "Website snelheid verbeteren: uitleg over Core Web Vitals (LCP, FID, CLS) en hoe je je site sneller maakt.",
  intro:
    "Website snelheid bepaalt voor een groot deel de gebruikerservaring en je positie in Google. Core Web Vitals (LCP, INP/FID, CLS) meten laadtijd, interactiviteit en visuele stabiliteit. Een snelle site houdt bezoekers vast en wordt door zoekmachines beter gewaardeerd.",
  benefits: [
    "Meting van Core Web Vitals (LCP, INP, CLS)",
    "Praktische tips om je site te versnellen",
    "Betere gebruikerservaring en lagere bounce",
    "Positief effect op zoekmachine rankings",
  ],
  exampleAnalysis:
    "De snelheidsanalyse toont onder meer LCP (hoe snel de hoofdcontent laadt), INP/FID (respons op interactie) en CLS (visuele stabiliteit). Bij knelpunten krijg je advies, bijvoorbeeld: optimaliseer afbeeldingen, gebruik caching of verklein JavaScript.",
  faqs: [
    {
      question: "Wat zijn Core Web Vitals?",
      answer:
        "Core Web Vitals zijn door Google gedefinieerde metrics: LCP (laadsnelheid van de hoofdcontent), INP/FID (responsiviteit) en CLS (visuele stabiliteit). Ze beïnvloeden gebruikerservaring en SEO.",
    },
    {
      question: "Hoe kan ik mijn website versnellen?",
      answer:
        "Vaak helpt het om afbeeldingen te optimaliseren, caching in te zetten, onnodige scripts te verwijderen en een snelle hosting te gebruiken. Onze analyse wijst de grootste knelpunten aan.",
    },
  ],
};

const CONVERSIE_BASE: SeoPageConfig = {
  title: "Conversie optimalisatie",
  description:
    "Website conversie verbeteren: inzicht in CTA's, formulieren en gebruikerservaring. Ontvang concrete verbeterpunten.",
  intro:
    "Conversie optimalisatie draait om het omzetten van bezoekers in klanten of leads. Een conversie-analyse kijkt naar calls-to-action, formulieren, vertrouwenselementen en de logische flow van je pagina's. Met gerichte aanpassingen verhoog je het aantal acties op je site.",
  benefits: [
    "Analyse van CTA's, formulieren en paginastructuur",
    "Advies voor meer vertrouwen en duidelijkheid",
    "Focus op acties die leiden tot conversie",
    "Toepasbare aanbevelingen per pagina",
  ],
  exampleAnalysis:
    "De conversie-analyse beoordeelt onder meer de zichtbaarheid en tekst van je call-to-action, de eenvoud van formulieren, het gebruik van social proof en de helderheid van je aanbod. Je krijgt per onderdeel een score en verbeterpunten.",
  faqs: [
    {
      question: "Wat is conversie optimalisatie?",
      answer:
        "Conversie optimalisatie is het verbeteren van je website en pagina's zodat meer bezoekers de gewenste actie uitvoeren: inschrijven, kopen, contact opnemen of een formulier invullen.",
    },
    {
      question: "Hoe meet ik conversie?",
      answer:
        "Conversie meet je door doelen te definiëren (bijv. formulierverzending, aankoop) en het percentage bezoekers te volgen dat die actie uitvoert. Onze tool geeft inzicht in elementen die conversie bevorderen of tegenwerken.",
    },
  ],
};

const AI_MARKETING_BASE: SeoPageConfig = {
  title: "AI marketing tools",
  description:
    "AI-gestuurde marketing- en SEO-tools: website-analyse, zoekwoorden en content. Snel inzicht en actie-adviezen.",
  intro:
    "AI marketing tools helpen je om sneller inzicht te krijgen in je website en marketing. Denk aan geautomatiseerde website-analyses, zoekwoordonderzoek en content-adviezen. Zo combineer je menselijke strategie met de snelheid en consistentie van AI.",
  benefits: [
    "Snel inzicht door geautomatiseerde analyses",
    "SEO- en content-adviezen op basis van data",
    "Minder handwerk, meer focus op strategie",
    "Nederlandstalige rapporten en aanbevelingen",
  ],
  exampleAnalysis:
    "Onze AI-tools leveren onder meer een website-audit met scores en verbeterpunten, zoekwoordideeën en suggesties voor meta-teksten of copy. De uitvoer is in het Nederlands en direct toepasbaar.",
  faqs: [
    {
      question: "Wat zijn AI marketing tools?",
      answer:
        "AI marketing tools zijn software die met kunstmatige intelligentie taken uitvoert zoals website-analyses, zoekwoordonderzoek of het genereren van teksten en adviezen. Ze ondersteunen je marketing en SEO.",
    },
    {
      question: "Zijn AI-tools geschikt voor SEO?",
      answer:
        "Ja. AI kan helpen bij het analyseren van je site, het vinden van zoekwoorden en het verbeteren van meta-teksten en content. De uitkomsten moet je altijd controleren en afstemmen op je doelen.",
    },
  ],
};

/** Slug → config. City pages and variants are generated below. */
function buildSeoPages(): Record<string, SeoPageConfig> {
  const pages: Record<string, SeoPageConfig> = {};

  // —— Category 1: Website analyse ——
  const websiteAnalyseSlugs = [
    "website-analyse",
    "website-analyse-gratis",
    "website-analyse-online",
    "website-analyse-tool",
    "website-analyse-seo",
  ];
  websiteAnalyseSlugs.forEach((slug) => {
    pages[slug] = {
      ...WEBSITE_ANALYSE_BASE,
      title: slug === "website-analyse" ? "Website analyse" : slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description:
        slug === "website-analyse-gratis"
          ? "Gratis website analyse: ontdek in één minuut hoe je site scoort op SEO, snelheid, UX en conversie."
          : slug === "website-analyse-online"
            ? "Online website analyse: voer vanaf elke plek een professionele audit uit. Direct scores en verbeterpunten."
            : slug === "website-analyse-tool"
              ? "Website analyse tool: gebruik onze tool voor een snelle, duidelijke analyse van je website."
              : slug === "website-analyse-seo"
                ? "Website analyse voor SEO: inzicht in je vindbaarheid en concrete stappen om hoger te ranken."
                : WEBSITE_ANALYSE_BASE.description,
    };
  });

  // —— Category 2: SEO check ——
  const seoCheckSlugs = ["seo-check", "seo-check-gratis", "seo-check-online", "seo-check-tool"];
  seoCheckSlugs.forEach((slug) => {
    pages[slug] = {
      ...SEO_CHECK_BASE,
      title: slug === "seo-check" ? "SEO check" : slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description:
        slug === "seo-check-gratis"
          ? "Gratis SEO check: controleer je website op zoekmachine-optimalisatie en ontvang direct verbeterpunten."
          : slug === "seo-check-online"
            ? "Online SEO check: voer vanaf elke locatie een professionele SEO-controle uit."
            : slug === "seo-check-tool"
              ? "SEO check tool: gebruik onze tool voor een snelle beoordeling van je SEO."
              : SEO_CHECK_BASE.description,
    };
  });

  // —— Category 3: Website snelheid ——
  const snelheidSlugs = ["website-snelheid-test", "website-snelheid-check", "website-snelheid-analyse"];
  snelheidSlugs.forEach((slug) => {
    pages[slug] = {
      ...WEBSITE_SNELHEID_BASE,
      title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description:
        slug === "website-snelheid-test"
          ? "Website snelheid test: meet de laadsnelheid en Core Web Vitals van je site. Direct verbeteradvies."
          : slug === "website-snelheid-check"
            ? "Website snelheid check: controleer of je site snel genoeg laadt voor bezoekers en zoekmachines."
            : "Website snelheid analyse: gedetailleerd inzicht in laadtijd en performance met aanbevelingen.",
    };
  });
  // Keep legacy slug
  pages["website-snelheid"] = { ...WEBSITE_SNELHEID_BASE };

  // —— Category 4: Conversie ——
  const conversieSlugs = ["website-conversie-analyse", "conversie-optimalisatie-tool", "conversie-check"];
  conversieSlugs.forEach((slug) => {
    pages[slug] = {
      ...CONVERSIE_BASE,
      title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description:
        slug === "website-conversie-analyse"
          ? "Website conversie analyse: ontdek waarom bezoekers wel of niet converteren en wat je kunt verbeteren."
          : slug === "conversie-optimalisatie-tool"
            ? "Conversie optimalisatie tool: analyseer CTA's, formulieren en flow met concrete verbeterpunten."
            : "Conversie check: snel inzicht in de conversie-elementen van je website.",
    };
  });
  pages["website-conversie-test"] = {
    ...CONVERSIE_BASE,
    title: "Website conversie test",
    description: "Test de conversie van je website: inzicht in CTA's, formulieren en gebruikersgedrag met verbeteradvies.",
  };

  // —— Category 5: AI marketing ——
  const aiSlugs = ["ai-marketing-tools", "ai-seo-tools", "ai-website-analyse"];
  aiSlugs.forEach((slug) => {
    pages[slug] = {
      ...AI_MARKETING_BASE,
      title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description:
        slug === "ai-marketing-tools"
          ? "AI marketing tools: geautomatiseerde analyses en adviezen voor je website en marketing."
          : slug === "ai-seo-tools"
            ? "AI SEO tools: gebruik AI voor snellere SEO-analyses en zoekwoordideeën."
            : "AI website analyse: laat je site door AI analyseren en ontvang duidelijke verbeterpunten.",
    };
  });

  // —— SEO audit (existing) ——
  pages["seo-audit"] = {
    ...SEO_CHECK_BASE,
    title: "SEO audit",
    description: "SEO audit: grondige controle van je website op zoekmachine-optimalisatie met een actieplan.",
    intro:
      "Een SEO audit is een grondige controle van de technische en content-matige SEO van je website. Denk aan indexeerbaarheid, titels en meta's, interne en externe links, en contentkwaliteit. Het resultaat is een overzicht van sterke punten en verbeterpunten.",
  };
  pages["seo-audit-gratis"] = {
    ...pages["seo-audit"],
    title: "SEO audit gratis",
    description: "Gratis SEO audit: voer een eerste controle van je website uit en ontvang verbeterpunten.",
  };

  // —— Platform-specific: SEO analyse per platform (growth engine) ——
  pages["seo-analyse-webshop"] = {
    ...WEBSITE_ANALYSE_BASE,
    title: "SEO analyse webshop",
    description:
      "SEO analyse voor webshops: ontdek hoe je online winkel scoort op vindbaarheid, snelheid en conversie. Gratis scan voor WooCommerce, Shopify en meer.",
    intro:
      "Een webshop heeft specifieke SEO-uitdagingen: productpagina's, categorieën, filters en checkout-flow. Onze SEO analyse voor webshops kijkt naar titels, meta's, structuur, snelheid en conversie-elementen. Of je nu WooCommerce, Shopify of een custom oplossing gebruikt: krijg inzicht in verbeterpunten die direct meer bezoekers en verkopen opleveren.",
    benefits: [
      "Specifiek voor webshop-structuur en productpagina's",
      "Inzicht in categorie- en filter-SEO",
      "Snelheid en Core Web Vitals voor e-commerce",
      "Conversie-optimalisatie voor checkout",
    ],
    faqs: [
      ...WEBSITE_ANALYSE_BASE.faqs,
      {
        question: "Werkt de SEO analyse voor mijn webshop?",
        answer:
          "Ja. Onze tool analyseert elke website, inclusief webshops op WooCommerce, Shopify, Magento of custom platforms. Je krijgt scores en verbeterpunten specifiek voor e-commerce.",
      },
    ],
    relatedLinks: [
      { label: "SEO analyse WordPress", href: "/seo/seo-analyse-wordpress" },
      { label: "SEO analyse Shopify", href: "/seo/seo-analyse-shopify" },
    ],
  };
  pages["seo-analyse-wordpress"] = {
    ...WEBSITE_ANALYSE_BASE,
    title: "SEO analyse WordPress",
    description:
      "SEO analyse voor WordPress-websites: controleer je site op vindbaarheid, snelheid en technische SEO. Gratis scan voor WP-sites.",
    intro:
      "WordPress is populair maar heeft specifieke SEO-uitdagingen: plugins, thema's, permalinks en laadsnelheid. Onze SEO analyse voor WordPress kijkt naar je titels, meta's, structuur, afbeeldingen en performance. Ontdek waar je WordPress-site scoort en wat je kunt verbeteren voor betere rankings.",
    benefits: [
      "Specifiek voor WordPress-structuur",
      "Controle van plugins en thema-impact",
      "Permalink- en sitemap-advies",
      "Snelheidsoptimalisatie voor WP",
    ],
    faqs: [
      ...WEBSITE_ANALYSE_BASE.faqs,
      {
        question: "Is de analyse geschikt voor WordPress?",
        answer:
          "Ja. Onze tool analyseert elke website, inclusief WordPress. We kijken naar SEO, snelheid en technische aspecten die voor WP-sites relevant zijn.",
      },
    ],
    relatedLinks: [
      { label: "SEO analyse webshop", href: "/seo/seo-analyse-webshop" },
      { label: "SEO analyse Shopify", href: "/seo/seo-analyse-shopify" },
    ],
  };
  pages["seo-analyse-shopify"] = {
    ...WEBSITE_ANALYSE_BASE,
    title: "SEO analyse Shopify",
    description:
      "SEO analyse voor Shopify-webshops: ontdek hoe je online store scoort op SEO, snelheid en conversie. Gratis scan voor Shopify-stores.",
    intro:
      "Shopify heeft een eigen structuur en technische setup. Onze SEO analyse voor Shopify kijkt naar je productpagina's, collecties, meta's, snelheid en conversie-elementen. Krijg concrete verbeterpunten om meer organisch verkeer en verkopen te genereren uit je Shopify-store.",
    benefits: [
      "Specifiek voor Shopify-structuur",
      "Product- en collectie-SEO",
      "Snelheid en Core Web Vitals",
      "Conversie-optimalisatie voor Shopify",
    ],
    faqs: [
      ...WEBSITE_ANALYSE_BASE.faqs,
      {
        question: "Werkt de analyse voor Shopify?",
        answer:
          "Ja. Onze tool analyseert elke website, inclusief Shopify-webshops. Je krijgt scores en verbeterpunten die je direct in je Shopify-admin kunt toepassen.",
      },
    ],
    relatedLinks: [
      { label: "SEO analyse webshop", href: "/seo/seo-analyse-webshop" },
      { label: "SEO analyse WordPress", href: "/seo/seo-analyse-wordpress" },
    ],
  };
  pages["seo-analyse-saas"] = {
    ...WEBSITE_ANALYSE_BASE,
    title: "SEO analyse SaaS",
    description:
      "SEO analyse voor SaaS-websites: optimaliseer landing pages en conversie voor software. Gratis scan voor SaaS en productbedrijven.",
    intro:
      "SaaS-websites hebben specifieke SEO-uitdagingen: landing pages, signup-flow en technische content. Onze SEO analyse voor SaaS kijkt naar structuur, conversie-elementen en vindbaarheid. Krijg concrete verbeterpunten om meer organisch verkeer en aanmeldingen te genereren.",
    benefits: [
      "SaaS- en landingpage-focus",
      "Conversie- en signup-optimalisatie",
      "Technische en content-SEO",
      "Aanbevelingen voor softwarebedrijven",
    ],
    faqs: [
      ...WEBSITE_ANALYSE_BASE.faqs,
      {
        question: "Werkt de analyse voor SaaS-websites?",
        answer:
          "Ja. Onze tool analyseert elke website, inclusief SaaS en product-sites. Je krijgt scores en verbeterpunten die je kunt inzetten voor betere vindbaarheid en conversie.",
      },
    ],
    relatedLinks: [
      { label: "SEO analyse webshop", href: "/seo/seo-analyse-webshop" },
      { label: "SEO analyse WordPress", href: "/seo/seo-analyse-wordpress" },
      { label: "SEO analyse Shopify", href: "/seo/seo-analyse-shopify" },
    ],
  };

  // —— City-based pages: website-analyse-[city] ——
  const cities = [
    { slug: "amsterdam", name: "Amsterdam" },
    { slug: "rotterdam", name: "Rotterdam" },
    { slug: "utrecht", name: "Utrecht" },
    { slug: "eindhoven", name: "Eindhoven" },
    { slug: "groningen", name: "Groningen" },
  ];
  cities.forEach(({ slug, name }) => {
    const key = `website-analyse-${slug}`;
    pages[key] = {
      ...WEBSITE_ANALYSE_BASE,
      title: `Website analyse ${name}`,
      description: `Website analyse voor ondernemers in ${name}: ontdek hoe je site scoort op SEO, snelheid en conversie. Gratis eerste scan.`,
      intro: `Een professionele website analyse is voor ondernemers in ${name} net zo belangrijk als elders. Of je nu lokaal of nationaal actief bent: inzicht in je SEO, snelheid, UX en conversie helpt je om meer bezoekers te bereiken en te converteren. Onze tool voer je online uit; je ontvangt binnen ongeveer 60 seconden scores en verbeterpunten.`,
      city: name,
      faqs: [
        ...WEBSITE_ANALYSE_BASE.faqs,
        {
          question: `Kunnen bedrijven in ${name} de website analyse gebruiken?`,
          answer: `Ja. De website analyse werkt voor elke website, ongeacht waar je bedrijf gevestigd is. Ondernemers in ${name} kunnen de tool net zo goed gebruiken om hun site te verbeteren.`,
        },
      ],
    };
  });

  return pages;
}

export const SEO_PAGES = buildSeoPages();

export function getAllSeoSlugs(): string[] {
  return Object.keys(SEO_PAGES);
}

export function getSeoPageConfig(slug: string): SeoPageConfig | null {
  return SEO_PAGES[slug] ?? null;
}

export { SITE_URL };
