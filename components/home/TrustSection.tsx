"use client";

import { motion } from "framer-motion";

const AUDIENCES = [
  { name: "Webshops", id: "1" },
  { name: "Marketingbureaus", id: "2" },
  { name: "SaaS bedrijven", id: "3" },
  { name: "Dienstverleners", id: "4" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function TrustSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-2xl font-semibold text-slate-900 md:text-4xl"
        >
          Voor wie is VDB Digital
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
        >
          {AUDIENCES.map((card) => (
            <motion.div
              key={card.id}
              variants={item}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)" }}
              className="flex min-h-[5rem] w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm transition-shadow duration-300 md:min-h-[6rem] md:px-6"
              style={{ willChange: "transform" }}
            >
              <span className="text-center text-lg font-semibold text-slate-800 md:text-xl">
                {card.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
