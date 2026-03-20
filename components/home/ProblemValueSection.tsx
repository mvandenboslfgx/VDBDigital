"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

const problems = [
  "Bezoekers haken af zonder actie",
  "Onduidelijke boodschap",
  "Geen sterke call-to-actions",
  "Trage laadtijd",
];

const outcomes = [
  "Concrete verbeterpunten (geen vage tips)",
  "Direct toepasbare fixes",
  "Inzicht in waar je omzet mist",
  "Prioriteitenlijst (wat eerst te fixen)",
];

export default function ProblemValueSection() {
  const CTA_CLASS =
    "bg-indigo-600 text-white px-8 py-4 text-lg rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95";
  return (
    <section className="py-20 md:py-28">
      <div className="section-container grid gap-10 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-3xl font-bold text-gray-900 md:text-5xl">Waarom je website klanten verliest</h2>
          <p className="mt-4 text-xl text-gray-500">
            De meeste websites zien er goed uit, maar converteren slecht.
          </p>
          <ul className="mt-6 space-y-3 text-gray-900">
            {problems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 text-indigo-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-medium text-gray-900">Resultaat: je laat dagelijks klanten liggen.</p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-3xl font-bold text-gray-900 md:text-5xl">Wat je krijgt na de scan</h2>
          <ul className="mt-6 space-y-3 text-gray-900">
            {outcomes.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 text-indigo-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/website-scan">
              <Button size="lg" className={CTA_CLASS}>
                Scan mijn website gratis
              </Button>
            </Link>
            <p className="mt-4 text-sm font-medium text-gray-500">
              Gemiddelde website verliest 20-40% van potentiële klanten.
            </p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
