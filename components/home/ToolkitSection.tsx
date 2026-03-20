"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";
import { stockPhotos } from "@/lib/stock-photos";

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
  const CTA_CLASS =
    "bg-indigo-600 text-white px-8 py-4 text-lg rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95";
  return (
    <section className="relative py-20 md:py-28">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl font-bold text-gray-900 md:text-5xl"
        >
          Alle tools om je website te laten groeien
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xl text-gray-500"
        >
          Van website-audit tot zoekwoorden, conversie en content: alles voor betere resultaten.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
        >
          <div className="relative -mx-8 -mt-8 aspect-[21/9] w-[calc(100%+4rem)] bg-indigo-50">
            <Image
              src={stockPhotos.tools}
              alt="Digitale tools en workspace"
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              unoptimized
            />
          </div>
        </motion.div>
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
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
                >
                  <span className="text-xl font-semibold text-gray-900">{tool.name}</span>
                  <span className="mt-2 text-base text-gray-500">{tool.desc}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-base font-medium text-indigo-600">
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
              <Button size="lg" className={CTA_CLASS}>
                Bekijk alle tools
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
