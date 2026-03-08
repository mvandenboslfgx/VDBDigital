"use client";

import { motion } from "framer-motion";

const points = [
  "Je website trekt bezoekers maar ze kopen niet.",
  "Je weet niet waarom bezoekers weggaan.",
  "Technische problemen (snelheid, SEO) kosten omzet.",
  "Concurrenten scoren beter in zoekmachines.",
];

export default function ProblemSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      <div className="section-container">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading"
        >
          Het probleem
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="section-title mt-2 max-w-2xl"
        >
          Veel websites zetten bezoekers niet om in klanten.
        </motion.h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 max-w-4xl">
          {points.map((text, i) => (
            <motion.li
              key={text}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
            >
              <span className="text-amber-400/80 mt-0.5">×</span>
              <span className="text-zinc-300">{text}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
