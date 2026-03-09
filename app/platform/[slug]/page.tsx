import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";

const PAGES: Record<
  string,
  { title: string; description: string; body: string[] }
> = {
  "hoe-het-werkt": {
    title: "Hoe het werkt",
    description: "In drie stappen naar een volledig website-rapport.",
    body: [
      "Je voert je website-URL in op de startpagina of via de scan-tool. Onze systemen halen de pagina op en analyseren technische data, content en structuur.",
      "AI verwerkt de data en berekent scores voor SEO, performance, gebruikerservaring en conversie. Je krijgt duidelijke verbeterpunten en prioriteiten.",
      "Het rapport is direct beschikbaar in je dashboard. Deel het via een link of exporteer gegevens voor presentaties en follow-up.",
    ],
  },
  "website-analyse": {
    title: "Website analyse",
    description: "Wat we meten en waarom.",
    body: [
      "We analyseren SEO (meta tags, koppen, zoekwoorden), performance (laadtijd, Core Web Vitals), gebruikerservaring (navigatie, leesbaarheid) en conversie-elementen (CTA's, formulieren, vertrouwen).",
      "Elke dimensie krijgt een score en concrete aanbevelingen. Geen jargon: actiegerichte tips die je direct kunt toepassen.",
    ],
  },
  "ai-technologie": {
    title: "AI technologie",
    description: "Slimme inzichten zonder black box.",
    body: [
      "We zetten AI in om ruwe data om te zetten in heldere teksten, prioriteiten en aanbevelingen. De scores zelf zijn gebaseerd op vaste regels; AI versterkt de uitleg.",
      "Zo krijg je het beste van beide: betrouwbare cijfers en begrijpelijke adviezen in het Nederlands.",
    ],
  },
  "rapport-systeem": {
    title: "Rapport systeem",
    description: "Scores, verbeterpunten en technische details.",
    body: [
      "Elk rapport toont een totaalscore en scores per categorie (SEO, performance, UX, conversie). Daarnaast: een overzicht van verbeterpunten, technische details (H1, afbeeldingen, links) en een betrouwbaarheidsindicator.",
      "Rapporten zijn sharebaar via een unieke link en blijven beschikbaar in je dashboard.",
    ],
  },
  agencies: {
    title: "Voor agencies",
    description: "Schaalbaar inzicht voor meerdere klanten.",
    body: [
      "Het platform is geschikt voor bureaus die meerdere websites willen analyseren. Met het Agency-plan krijg je meer scans, CRM-mogelijkheden en prioriteitsondersteuning.",
      "Neem contact op voor een offerte op maat en mogelijkheden voor white-label of API.",
    ],
  },
  integraties: {
    title: "Integraties",
    description: "Koppel met je eigen tools en workflow.",
    body: [
      "We werken aan API-toegang en koppelingen met veelgebruikte platformen. Zo kun je rapporten en data in je eigen omgeving gebruiken.",
      "Heb je een concreet integratievraag? Laat het ons weten via de contactpagina.",
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return {};
  return pageMetadata({
    title: `${page.title} | Platform`,
    description: page.description,
    path: `/platform/${slug}`,
  });
}

export default async function PlatformSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <nav className="mb-10 text-sm text-marketing-textSecondary">
          <Link href="/platform" className="hover:text-gold transition-colors">
            Platform
          </Link>
          <span className="mx-2">/</span>
          <span className="text-marketing-text">{page.title}</span>
        </nav>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold text-marketing-text md:text-4xl">
            {page.title}
          </h1>
          <p className="mt-4 text-lg text-marketing-textSecondary">
            {page.description}
          </p>
          <div className="mt-12 space-y-6">
            {page.body.map((para, i) => (
              <p key={i} className="text-lg text-marketing-textSecondary leading-relaxed">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/website-scan"
              className="inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-goldHover"
            >
              Start gratis analyse
            </Link>
            <Link
              href="/platform"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-surface px-6 py-3 text-base font-semibold text-marketing-text transition-colors hover:bg-slate-50"
            >
              Terug naar platform
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
