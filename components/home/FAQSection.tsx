"use client";

import { motion } from "framer-motion";

const faqs: { q: string; a: string }[] = [
  { q: "Hoeveel scans krijg ik gratis?", a: "Met het gratis account kun je 1 scan per maand uitvoeren. Je krijgt scores voor SEO, performance, UX en conversie plus een beknopt rapport." },
  { q: "Wat is het verschil tussen de abonnementen?", a: "Starter (€29/maand) geeft 25 scans en toegang tot AI-tools. Growth (€79/maand) biedt 150 scans en meer AI-credits. Agency (€199/maand) biedt 500 scans met CRM en prioriteitsondersteuning." },
  { q: "Kan ik elk moment opzeggen?", a: "Ja. Je kunt je abonnement in het dashboard beheren en opzeggen via het Stripe-portaal. Na afloop van de betaalperiode ga je terug naar het gratis plan." },
  { q: "Wordt mijn website opgeslagen?", a: "We analyseren je website en bewaren alleen de resultaten (scores en rapport) in je account. De inhoud van je site wordt niet opgeslagen voor andere doeleinden." },
];

export default function FAQSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-semibold text-marketing-text md:text-4xl"
        >
          Veelgestelde vragen
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-center text-lg text-marketing-textSecondary max-w-2xl mx-auto"
        >
          Alles wat je moet weten.
        </motion.p>
        <dl className="mt-14 max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <dt className="text-lg font-semibold text-marketing-text">{faq.q}</dt>
              <dd className="mt-3 text-lg text-marketing-textSecondary">{faq.a}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
