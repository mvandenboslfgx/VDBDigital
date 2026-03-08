"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    title: "AI-websiteanalyse",
    description:
      "Eén scan: SEO, performance, UX en conversie. Duidelijke scores en prioriteiten—geen giswerk.",
    href: "/dashboard/audits",
  },
  {
    title: "Groeionderzoek",
    description:
      "Begrijp waarom bezoekers weggaan en waar je conversie verliest. We laten zien wat écht impact heeft.",
    href: "/dashboard/reports",
  },
  {
    title: "Conversieverbetering",
    description:
      "Van copy tot structuur tot techniek. Elke aanbeveling koppelen we aan impact, zodat je weet wat eerst moet.",
    href: "/pricing",
  },
];

export default function ProductFeatures() {
  return (
    <section className="py-24 md:py-32">
      <div className="section-container">
        <p className="section-heading">Product</p>
        <h2 className="section-title mt-2">
          Gebouwd voor wie resultaat wil.
        </h2>
        <p className="text-sub mt-4 max-w-2xl">
          Geen agency-dashboard. Een control room voor de groei van je website—AI-analyse, duidelijke scores en concrete volgende stappen.
        </p>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <Link
                href={f.href}
                className="group block rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-panel transition-all duration-200 hover:border-white/[0.1] hover:shadow-elevated"
              >
                <span className="text-3xl font-semibold text-white group-hover:text-gold transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {f.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-gold group-hover:underline">
                  Meer info →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
