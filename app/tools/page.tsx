import { motion } from "framer-motion";
import ToolCard from "@/components/tools/ToolCard";

const TOOLS = [
  {
    href: "/tools/website-audit",
    title: "AI Website Audit",
    description: "Scan je website op SEO, performance, UX en conversie. Ontvang scores en actiegerichte adviezen.",
  },
  {
    href: "/tools/seo-keyword-finder",
    title: "SEO Keyword Finder",
    description: "Vind zoekwoorden en content-ideeën op basis van je website of een keyword. Inclusief zoekintentie.",
  },
  {
    href: "/tools/conversion-analyzer",
    title: "Conversie Analyzer",
    description: "Analyseer CTA's, vertrouwenselementen, paginastructuur en formulieren. Krijg verbetervoorstellen.",
  },
  {
    href: "/tools/performance-check",
    title: "Performance Analyzer",
    description: "Core Web Vitals: LCP, CLS, FID. Pagina-snelheid en concrete performance-tips.",
  },
  {
    href: "/tools/competitor-analyzer",
    title: "Concurrentie Analyzer",
    description: "Vergelijk je website met een concurrent op SEO, content, UX en conversie. Ontdek voordelen.",
  },
  {
    href: "/tools/content-generator",
    title: "Content Generator",
    description: "Genereer een SEO-blogartikel, metatitel, meta description en koppen op basis van een onderwerp.",
  },
  {
    href: "/tools/copy-optimizer",
    title: "Copy Optimizer",
    description: "Plak je tekst en ontvang verbeterde copy, sterkere headlines en betere oproepen tot actie.",
  },
  {
    href: "/tools/marketing-strategy",
    title: "Marketing Strategie Generator",
    description: "Krijg een op maat marketingstrategie met kanalen, prioriteiten en actiepunten op basis van je doelen.",
  },
];

export const metadata = {
  title: "AI Marketing Tools | VDB Digital",
  description:
    "Website-audit, SEO keyword finder, conversie- en performance-analyzer, copy optimizer, concurrentie-analyzer, content generator en marketingstrategie.",
};

export default function ToolsIndexPage() {
  return (
    <div className="section-container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-14 text-center"
        >
          <p className="section-heading">AI Marketing Toolkit</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl lg:text-5xl">
            Alles-in-één marketing tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-marketing-textSecondary">
            Scan websites, vind keywords, optimaliseer conversie en genereer content—met AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TOOLS.map((tool, i) => (
            <ToolCard
              key={tool.href}
              href={tool.href}
              title={tool.title}
              description={tool.description}
              variant="light"
            />
          ))}
        </motion.div>
      </div>
  );
}
