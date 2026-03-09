"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const cards = [
  {
    title: "SEO-analyse",
    desc: "Beoordeling van titel, meta-omschrijving, koppen, canonicals en gestructureerde data.",
    href: "/tools/website-audit",
  },
  {
    title: "UX-analyse",
    desc: "Inzicht in navigatie, leesbaarheid, afbeeldingen en mobiele bruikbaarheid.",
    href: "/tools/website-audit",
  },
  {
    title: "Conversie-analyse",
    desc: "CTA's, formulieren en vertrouwenselementen—wat zet bezoekers aan tot actie.",
    href: "/tools/conversion-analyzer",
  },
  {
    title: "Prestatie-analyse",
    desc: "Snelheid, Core Web Vitals en technische optimalisatie.",
    href: "/tools/performance-check",
  },
];

export default function WhatYouGetSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="section-container">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading"
        >
          Wat u krijgt
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="section-title mt-2"
        >
          Vier pijlers van uw rapport
        </motion.h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.05 }}
            >
              <Link
                href={card.href}
                className="block h-full rounded-2xl border border-marketing-border bg-surface p-6 shadow-marketing-card transition-shadow hover:border-gold/30 hover:shadow-marketing-card-hover"
              >
                <h3 className="text-lg font-semibold text-marketing-text">{card.title}</h3>
                <p className="mt-2 text-sm text-marketing-textSecondary">{card.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
