"use client";

import { motion } from "framer-motion";

const testimonials = [
  { quote: "Eindelijk helder inzicht in waarom onze site niet converteerde. Binnen een week eerste aanpassingen gedaan.", author: "Marketingmanager, B2B", role: "" },
  { quote: "De AI-adviezen zijn concreet en direct toepasbaar. Geen eindrapporten meer—gewoon doen.", author: "E-commerce", role: "" },
  { quote: "Snel, professioneel en in het Nederlands. Precies wat we zochten.", author: "Webbureau", role: "" },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      <div className="section-container">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading"
        >
          Ervaringen
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="section-title mt-2"
        >
          Wat anderen zeggen over VDB Digital.
        </motion.h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.06 }}
              className="rounded-2xl border border-white/[0.06] bg-[#111113] p-6"
            >
              <p className="text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm text-zinc-500">— {t.author}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
