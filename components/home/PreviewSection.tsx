"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

const PREVIEW_ISSUES = [
  "Onduidelijke eerste indruk (bezoekers begrijpen je aanbod niet direct)",
  "Geen sterke call-to-action op je homepage",
  "Trage laadtijd (bezoekers haken af binnen 3 seconden)",
];

export default function PreviewSection() {
  const CTA_CLASS =
    "bg-indigo-600 text-white px-8 py-4 text-lg rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95";
  return (
    <section className="py-20 md:py-28">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Voorbeeld van jouw scan</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-5xl">
            Dit kost je nu dagelijks klanten
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-[180px,1fr] md:items-start">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Conversie score</p>
              <p className="mt-1 text-4xl font-semibold text-gray-900">62</p>
              <p className="text-sm text-gray-500">/100</p>
            </div>

            <ul className="space-y-3 pl-2 text-gray-900">
              {PREVIEW_ISSUES.map((issue) => (
                <li key={issue} className="flex gap-2">
                  <span className="mt-1 text-red-500">❌</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-base font-medium text-gray-900">Geschatte impact: -25% tot -40% minder leads.</p>
          <p className="mt-2 text-sm text-gray-500">Dit zien we bij de meeste websites die we analyseren.</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/website-scan">
              <Button size="lg" className={CTA_CLASS}>
                Ontdek wat jouw website kost →
              </Button>
            </Link>
            <p className="text-sm font-medium text-gray-500">
              Je ziet direct wat prioriteit heeft en wat direct omzet kan opleveren.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
