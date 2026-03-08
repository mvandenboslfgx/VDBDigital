import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    slug: "seo",
    title: "SEO",
    description: "Zoekmachine-optimalisatie, zoekwoorden, technische SEO en content voor betere vindbaarheid.",
    href: "/kennis/seo",
  },
  {
    slug: "website-snelheid",
    title: "Website snelheid",
    description: "Core Web Vitals, performance-tips en snellere laadtijden voor betere gebruikerservaring.",
    href: "/kennis/website-snelheid",
  },
  {
    slug: "conversie-optimalisatie",
    title: "Conversie optimalisatie",
    description: "CTA's, formulieren, vertrouwen en paginastructuur die bezoekers tot actie brengen.",
    href: "/kennis/conversie-optimalisatie",
  },
  {
    slug: "ai-marketing",
    title: "AI marketing",
    description: "Hoe je AI inzet voor copy, zoekwoorden, analyses en strategie zonder kwaliteit in te leveren.",
    href: "/kennis/ai-marketing",
  },
  {
    slug: "digitale-strategie",
    title: "Digitale strategie",
    description: "Doelen stellen, kanalen kiezen en een heldere digitale roadmap voor je bedrijf.",
    href: "/kennis/digitale-strategie",
  },
];

export const metadata = {
  title: "Kennisbank | VDB Digital",
  description:
    "Artikelen over SEO, website snelheid, conversie-optimalisatie, AI marketing en digitale strategie. Duidelijke uitleg en actietips.",
};

export default function KennisPage() {
  return (
    <SiteShell>
      <div className="section-container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-14 text-center"
        >
          <p className="section-heading">Kennisbank</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl lg:text-5xl">
            Leer en verbeter
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-marketing-textSecondary">
            Duidelijke uitleg over SEO, snelheid, conversie en AI. Met voorbeelden en een directe link naar onze tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group block rounded-2xl border border-marketing-border bg-white p-6 shadow-marketing-card transition-shadow hover:border-gold/30 hover:shadow-marketing-card-hover"
            >
              <h2 className="text-lg font-semibold text-marketing-text group-hover:text-gold transition-colors">
                {cat.title}
              </h2>
              <p className="mt-2 text-sm text-marketing-textSecondary">
                {cat.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-gold">
                Artikelen bekijken →
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </SiteShell>
  );
}
