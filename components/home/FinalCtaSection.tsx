"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export default function FinalCtaSection() {
  return (
    <section className="relative py-24 md:py-32">
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(79,70,229,0.06),transparent)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.01 }}
          className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-surface p-12 md:p-16 text-center shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <h2 className="text-3xl font-semibold text-marketing-text md:text-4xl">
            Ontdek binnen 60 seconden hoe je website beter kan presteren
          </h2>
          <p className="text-lg text-marketing-textSecondary mt-6">
            Maak een gratis account. Vul je URL in. Krijg scores voor SEO, performance, UX en conversie—en ontgrendel het volledige rapport wanneer je wilt.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href="/website-scan">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                  Start gratis analyse
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href="#prijzen">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold">
                  Bekijk prijzen
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
