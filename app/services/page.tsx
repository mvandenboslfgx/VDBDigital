import SiteShell from "@/components/SiteShell";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/metadata";
import { ServiceStructuredData } from "@/components/StructuredData";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "Diensten",
  description:
    "Website-ontwerp, AI-websitebuilder, SEO-optimalisatie, website-audits, conversie-optimalisatie, marketingfunnels en analytics. VDB Digital bouwt digitale infrastructuur die converteert.",
  path: "/services",
});

const pillars = [
  {
    title: "Digitale infrastructuur",
    subtitle: "Websites die zich gedragen als systemen, niet als brochures.",
    points: [
      "Architectuur die weerspiegelt hoe jouw bedrijf echt verkoopt en levert.",
      "Paginahiërarchieën afgestemd op ontdekking, diepte en besluitvorming.",
      "Bewuste aandacht voor performance, toegankelijkheid en robuustheid vanaf dag één.",
    ],
  },
  {
    title: "Review- & reputatiesystemen",
    subtitle: "Bewijs dat in jouw voordeel stapelt.",
    points: [
      "Doordachte reviewflows ingebed in je echte touchpoints.",
      "On-site social proof die precies voelt, niet schreeuwerig of generiek.",
      "Geautomatiseerde prompts en routing zodat goede ervaringen nooit onbenut blijven.",
    ],
  },
  {
    title: "Conversie-optimalisatie",
    subtitle: "Interfaces ontworpen voor een helder ‘ja’ of ‘nu nog niet’.",
    points: [
      "Boodschap en hiërarchie getest op hoe kopers echt denken.",
      "Micro-interacties die twijfel verminderen in plaats van hype toe te voegen.",
      "Analytics die het volledige pad van bezoek tot voorstel inzichtelijk maken.",
    ],
  },
  {
    title: "Automatisering & opschalen",
    subtitle: "Kalm lopende operatie achter elke interactie.",
    points: [
      "Workflows die je website verbinden met de tools die je team al gebruikt.",
      "Automatiseringen die repetitief werk wegnemen zonder controle te verliezen.",
      "Systemen die groei ondersteunen, zonder bij elke fase opnieuw te moeten bouwen.",
    ],
  },
];

const toolLinks = [
  { label: "AI Website Builder", href: "/builder", description: "Genereer een sitestructuur op basis van je bedrijfstype en stijl." },
  { label: "Website-audit", href: "/audit", description: "Scan je website op SEO, UX en performance. Ontvang een score en aanbevelingen." },
  { label: "AI Copy Generator", href: "/ai-copy", description: "Genereer hero-, diensten- en SEO-tekst op basis van je merk." },
  { label: "Funnel Builder", href: "/funnel-builder", description: "Genereer landingspagina-structuur, offer en e-mailfunnel." },
  { label: "Competitor Analyzer", href: "/competitor-analyzer", description: "Vergelijk je markt op SEO en designkwaliteit." },
];

export default function ServicesPage() {
  return (
    <SiteShell>
      <ServiceStructuredData
        name="Digitale diensten"
        description="Website-ontwerp, AI-websitebuilder, SEO, audits, conversie-optimalisatie, funnels en analytics."
        url="/services"
      />
      <PageTransition>
        <PageHero
          eyebrow="DIENSTEN"
          title="Digitale infrastructuur voor onvermijdelijke merken."
          subtitle="We ontwerpen en bouwen de onderliggende systemen die bezoekers stilletjes van eerste indruk naar getekende overeenkomst bewegen. Inclusief AI-tools voor builder, audit, copy en funnels."
        />
        <section className="section-container pb-12">
          <h2 className="section-heading mt-4">Tools & diensten</h2>
          <p className="text-sm text-gray-300/90 max-w-2xl mt-2">
            Deze tools en diensten zijn beschikbaar op het platform. Gebruik ze zelf of neem <Link href="/contact" className="text-gold hover:underline">contact</Link> op voor een op maat traject.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-2xl border border-white/10 bg-black/60 p-4 hover:border-gold/50 hover:bg-black/80 transition-colors"
                >
                  <span className="font-semibold text-white">{item.label}</span>
                  <p className="mt-1 text-xs text-gray-400">{item.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="pb-28">
          <div className="section-container space-y-10">
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#181818] via-black to-black/95 p-6 sm:p-8 shadow-[0_26px_70px_rgba(0,0,0,0.95)]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_top_left,_rgba(198,169,93,0.2),transparent_60%)]" />
                <div className="relative grid gap-6 lg:grid-cols-[1.2fr,1.1fr] items-start">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      {pillar.title}
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-300/90">
                      {pillar.subtitle}
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300/90">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      </PageTransition>
    </SiteShell>
  );
}

