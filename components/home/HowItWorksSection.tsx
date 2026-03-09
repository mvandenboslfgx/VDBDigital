"use client";

import { motion } from "framer-motion";

const steps = [
  { num: "1", title: "Vul je website in", desc: "Geef het adres van je website. Wij halen de pagina op en analyseren deze." },
  { num: "2", title: "AI analyseert je site", desc: "SEO, prestaties, gebruikerservaring en conversie worden gemeten en beoordeeld." },
  { num: "3", title: "Ontvang een volledig rapport", desc: "Scores, verbeterpunten en prioriteiten—direct in je rapport of dashboard." },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-semibold text-marketing-text md:text-4xl"
        >
          Hoe het werkt
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-center text-lg text-marketing-textSecondary max-w-2xl mx-auto"
        >
          In drie simpele stappen naar inzicht.
        </motion.p>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-marketing-border bg-surface p-8 shadow-sm transition-shadow duration-300 hover:shadow-marketing-card-hover"
            >
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 + i * 0.1 }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-lg font-semibold text-gold"
              >
                {step.num}
              </motion.span>
              <h3 className="mt-6 text-xl font-semibold text-marketing-text">{step.title}</h3>
              <p className="mt-3 text-lg text-marketing-textSecondary">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
