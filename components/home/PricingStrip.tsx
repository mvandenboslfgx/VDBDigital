"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

const plans = [
  { name: "Gratis", price: "€0", desc: "1 scan per maand", cta: "Account aanmaken", href: "/create-account" },
  { name: "Starter", price: "€29", desc: "25 scans, AI-tools", cta: "Start Starter", href: "/dashboard/billing?upgrade=starter" },
  { name: "Growth", price: "€79", desc: "150 scans, meer AI", cta: "Start Growth", href: "/dashboard/billing?upgrade=growth", highlight: true, badge: "Meest gekozen" },
  { name: "Agency", price: "€199", desc: "500 scans, CRM", cta: "Neem contact op", href: "/contact?plan=agency" },
];

export default function PricingStrip() {
  return (
    <section id="prijzen" className="py-24 md:py-32">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-semibold text-marketing-text md:text-4xl"
        >
          Eenvoudige plannen
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-center text-lg text-marketing-textSecondary max-w-2xl mx-auto"
        >
          Starter, Growth of Agency. Kies wat bij je past.
        </motion.p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl border p-8 transition-shadow duration-300 ${
                p.highlight
                  ? "border-blue-200 bg-blue-50/50 shadow-md hover:shadow-lg"
                  : "border-gray-200 bg-surface shadow-sm hover:shadow-md"
              }`}
            >
              {p.badge && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 + i * 0.08 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  {p.badge}
                </motion.span>
              )}
              <h3 className="text-xl font-semibold text-marketing-text">{p.name}</h3>
              <p className="mt-3 text-3xl font-semibold text-marketing-text">{p.price}</p>
              <p className="text-base text-marketing-textSecondary">/maand</p>
              <p className="mt-3 text-lg text-marketing-textSecondary">{p.desc}</p>
              <Link href={p.href} className="mt-6 block">
                <Button
                  variant={p.highlight ? "primary" : "outline"}
                  size="lg"
                  className="w-full px-8 py-4 text-lg font-semibold"
                >
                  {p.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
