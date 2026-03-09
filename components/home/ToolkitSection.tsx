"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";

const TOOLS = [
  { name: "AI Website Audit", desc: "Analyseer je website op SEO, UX, conversie en prestaties.", href: "/tools/website-audit" },
  { name: "SEO Keyword Finder", desc: "Vind relevante zoekwoorden en content-ideeën.", href: "/tools/seo-keyword-finder" },
  { name: "Conversion Analyzer", desc: "Verbeter CTA's, formulieren en vertrouwenselementen.", href: "/tools/conversion-analyzer" },
  { name: "Performance Analyzer", desc: "Core Web Vitals en snelheidsadviezen.", href: "/tools/performance-check" },
  { name: "Competitor Analyzer", desc: "Vergelijk je site met concurrenten.", href: "/tools/competitor-analyzer" },
  { name: "Content Generator", desc: "Genereer SEO-vriendelijke artikelen en meta-teksten.", href: "/tools/content-generator" },
  { name: "Copy Optimizer", desc: "Optimaliseer teksten voor leesbaarheid en conversie.", href: "/tools/copy-optimizer" },
  { name: "Marketing Strategie Generator", desc: "Genereer een marketingstrategie op basis van je doelen.", href: "/tools/marketing-strategy" },
];

export default function ToolkitSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-semibold text-marketing-text md:text-4xl"
        >
          Alle tools om je website te laten groeien
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-center text-lg text-marketing-textSecondary max-w-2xl mx-auto"
        >
          Van website-audit tot zoekwoorden, conversie en content: alles voor betere resultaten.
        </motion.p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                <Link
                  href={tool.href}
                  className="group flex flex-col rounded-2xl border border-marketing-border bg-surface p-8 shadow-marketing-card transition-all duration-300 hover:border-gold/30 hover:shadow-lg"
                >
                  <span className="text-lg font-semibold text-marketing-text">{tool.name}</span>
                  <span className="mt-2 text-lg text-marketing-textSecondary">{tool.desc}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-base font-medium text-gold">
                    Bekijk tool
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/tools">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                Bekijk alle tools
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
