"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { stockPhotos } from "@/lib/stock-photos";

const CATEGORIES = [
  { title: "SEO", href: "/kennisbank/seo", image: stockPhotos.seo, alt: "SEO en zoekmachines" },
  { title: "Website snelheid", href: "/kennisbank/website-snelheid", image: stockPhotos.speed, alt: "Website snelheid" },
  { title: "Conversie", href: "/kennisbank/conversie", image: stockPhotos.conversion, alt: "Conversie optimalisatie" },
  { title: "AI marketing", href: "/kennisbank/ai-marketing", image: stockPhotos.aiMarketing, alt: "AI en marketing" },
  { title: "Digitale strategie", href: "/kennisbank/digitale-strategie", image: stockPhotos.strategy, alt: "Digitale strategie" },
];

export default function KnowledgeHubSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl font-bold text-gray-900 md:text-5xl"
        >
          Leer hoe je je website optimaliseert
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xl text-gray-500"
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
                className="block overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md"
              >
                <div className="relative -mx-8 -mt-8 aspect-[16/10] w-[calc(100%+4rem)] bg-indigo-50">
                  <Image
                    src={cat.image}
                    alt={cat.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="pt-8">
                  <span className="text-xl font-semibold text-gray-900">{cat.title}</span>
                </div>
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
            href="/kennisbank"
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
