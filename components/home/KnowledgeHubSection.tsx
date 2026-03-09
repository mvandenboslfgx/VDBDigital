"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = [
  { title: "SEO", href: "/kennisbank/seo" },
  { title: "Website snelheid", href: "/kennisbank/website-snelheid" },
  { title: "Conversie", href: "/kennisbank/conversie" },
  { title: "AI marketing", href: "/kennisbank/ai-marketing" },
  { title: "Digitale strategie", href: "/kennisbank/digitale-strategie" },
];

export default function KnowledgeHubSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-semibold text-marketing-text md:text-4xl"
        >
          Leer hoe je je website optimaliseert
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-center text-lg text-marketing-textSecondary max-w-2xl mx-auto"
        >
          Duidelijke uitleg over SEO, snelheid, conversie en AI. Met voorbeelden en een link naar de juiste tool.
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-3"
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.href}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
            >
              <Link
                href={cat.href}
                className="block rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm text-center transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
              >
                <span className="text-lg font-semibold text-marketing-text">{cat.title}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            href="/kennis"
            className="group inline-flex items-center gap-1 text-lg font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Alle artikelen in de kennisbank
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
