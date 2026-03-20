"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

const plans = [
  {
    name: "Quick Win",
    price: "€149 - €299",
    desc: "Voor ondernemers die snel resultaat willen.",
    features: [
      "3-5 concrete verbeterpunten",
      "CTA + homepage optimalisatie",
      "Korte video/tekst uitleg",
    ],
    cta: "Start met Quick Win",
    href: "/contact?pakket=quick-win",
  },
  {
    name: "Growth",
    price: "€399 - €799",
    desc: "Voor bedrijven die serieus meer uit hun website willen halen.",
    features: [
      "Alles uit Quick Win",
      "Volledige homepage optimalisatie",
      "Conversie structuur verbeterd",
      "Copy verbeteringen",
    ],
    cta: "Kies Growth",
    href: "/contact?pakket=growth",
    highlight: true,
    badge: "Meest gekozen",
  },
  {
    name: "Pro",
    price: "€999 - €1999",
    desc: "Voor maximale impact en het beste resultaat.",
    features: [
      "Alles uit Growth",
      "Meerdere pagina's optimaliseren",
      "Funnel verbetering",
      "Advies + implementatie",
    ],
    cta: "Plan Pro traject",
    href: "/contact?pakket=pro",
  },
];

export default function PricingStrip() {
  const CTA_CLASS =
    "bg-indigo-600 text-white px-8 py-4 text-lg rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95";
  return (
    <section id="prijzen" className="py-20 md:py-28">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-gray-900 md:text-5xl"
        >
          Kies het niveau dat past bij je groeidoel
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xl text-gray-500"
        >
          De meeste bedrijven kiezen Growth, omdat daar de meeste winst zit.
        </motion.p>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md ${
                p.highlight
                  ? "ring-2 ring-indigo-600"
                  : ""
              }`}
            >
              {p.badge && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 + i * 0.08 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                >
                  {p.badge}
                </motion.span>
              )}
              <h3 className="text-xl font-semibold text-gray-900">{p.name}</h3>
              <p className="mt-3 text-3xl font-semibold text-gray-900">{p.price}</p>
              <p className="mt-3 text-base text-gray-500">{p.desc}</p>
              <ul className="mt-5 space-y-2 text-sm text-gray-500">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-indigo-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={p.href} className="mt-6 block">
                <Button
                  size="lg"
                  className={`${CTA_CLASS} w-full`}
                >
                  {p.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Liever klein starten? Begin met Quick Win en schaal daarna door naar Growth.
        </p>
      </div>
    </section>
  );
}
