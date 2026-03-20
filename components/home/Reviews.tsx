"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";

const INSIGHTS = [
  {
    title: "Snelle eerste scan",
    text: "Ontvang direct een eerste score voor SEO, performance, UX en conversie.",
    label: "Realtime analyse",
  },
  {
    title: "Concrete verbeterpunten",
    text: "Per onderdeel zie je wat je kunt verbeteren en welke impact dat heeft.",
    label: "Actiegericht",
  },
  {
    title: "Gemaakt voor teams",
    text: "Gebruik de uitkomsten voor development, marketing en content in een workflow.",
    label: "Team-ready",
  },
  {
    title: "Eerlijk en transparant",
    text: "Geen verzonnen testimonials: we tonen platforminzichten in plaats van fictieve citaten.",
    label: "Zonder hype",
  },
];

function InsightCard({ title, text, label }: (typeof INSIGHTS)[0]) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
      <span className="inline-flex w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
        {label}
      </span>
      <p className="mt-4 text-lg font-semibold text-gray-900">{title}</p>
      <p className="mt-2 line-clamp-3 text-base text-gray-700">{text}</p>
    </div>
  );
}

export default function Reviews() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="overflow-hidden py-20 md:py-28" aria-labelledby="reviews-heading">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="section-container text-center"
      >
        <h2 id="reviews-heading" className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Waarom teams dit gebruiken
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xl text-gray-500">
          Transparante productinzichten in plaats van fictieve klantquotes.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="section-container mt-10"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INSIGHTS.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
