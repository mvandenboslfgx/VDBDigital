"use client";

import { motion } from "framer-motion";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  description,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
}) {
  const body = subtitle ?? description ?? "";
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(198,169,93,0.14),transparent_55%),radial-gradient(circle_at_bottom,_rgba(0,0,0,0.96),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl space-y-6"
        >
          {eyebrow && (
            <p className="text-[11px] font-semibold tracking-[0.28em] text-gray-400 uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold tracking-tight">
            {title}
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-gray-300/90">
            {body}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

