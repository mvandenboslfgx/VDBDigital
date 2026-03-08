"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";

const TOOLS = [
  "Website-audit",
  "SEO Keyword Finder",
  "Conversion Analyzer",
  "Copy Optimizer",
  "Competitor Analyzer",
  "Performance Check",
  "Content Generator",
];

export default function AIToolsOverviewSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="section-heading text-amber-400/90">AI Marketing Toolkit</p>
          <h2 className="section-title mt-2">
            Zeven tools. Eén platform.
          </h2>
          <p className="text-sub mx-auto mt-4 max-w-2xl">
            Van website-scan tot keyword-ideeën, conversie-analyse en content: alles voor betere resultaten.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {TOOLS.map((name) => (
            <span
              key={name}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300"
            >
              {name}
            </span>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 text-center"
        >
          <Link href="/tools">
            <Button size="lg">Bekijk alle tools</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
