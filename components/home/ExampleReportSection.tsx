"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const EXAMPLE_SCORES = [
  { label: "SEO score", value: 78 },
  { label: "Performance", value: 72 },
  { label: "UX", value: 84 },
  { label: "Conversie", value: 69 },
];

const RECOMMENDATIONS = [
  "Verbeter Core Web Vitals",
  "Optimaliseer meta titles",
  "Versnel afbeeldingen",
];

export default function ExampleReportSection() {
  const avg = Math.round(
    EXAMPLE_SCORES.reduce((s, x) => s + x.value, 0) / EXAMPLE_SCORES.length
  );
  return (
    <section className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-semibold text-marketing-text md:text-4xl"
        >
          Voorbeeld analyse
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-center text-lg text-marketing-textSecondary max-w-2xl mx-auto"
        >
          Een voorbeeld van scores en aanbevelingen. Zo ziet uw rapport eruit.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="mx-auto mt-14 max-w-3xl rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <p className="text-center text-sm font-medium uppercase tracking-wider text-marketing-textSecondary">
            Totaalscore (voorbeeld)
          </p>
          <p className="mt-2 text-center text-4xl font-semibold text-marketing-text md:text-5xl">
            {avg} <span className="text-xl text-marketing-textSecondary">/ 100</span>
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {EXAMPLE_SCORES.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.06 }}
                className="rounded-xl border border-gray-200 bg-surface p-6 text-center transition-transform duration-200 hover:scale-[1.02]"
              >
                <p className="text-3xl font-semibold text-marketing-text">{s.value}</p>
                <p className="mt-1 text-base text-marketing-textSecondary">{s.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-marketing-text">Aanbevelingen (voorbeeld)</p>
            <ul className="mt-3 space-y-2">
              {RECOMMENDATIONS.map((rec) => (
                <li key={rec} className="flex items-center gap-2 text-lg text-marketing-textSecondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-center text-lg text-marketing-textSecondary">
            Elk rapport bevat technische data (H1, afbeeldingen, links, viewport) en een betrouwbaarheidsindicator.
          </p>
          <motion.div className="mt-8 flex justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/website-scan"
              className="rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-goldHover"
            >
              Zelf een scan uitvoeren
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
