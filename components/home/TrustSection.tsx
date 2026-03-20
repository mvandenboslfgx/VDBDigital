"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { stockPhotos } from "@/lib/stock-photos";

const AUDIENCES = [
  { name: "Webshops", id: "1", image: stockPhotos.webshop, alt: "Webshop en e-commerce" },
  { name: "Marketingbureaus", id: "2", image: stockPhotos.marketing, alt: "Marketingteam aan het werk" },
  { name: "SaaS bedrijven", id: "3", image: stockPhotos.saas, alt: "SaaS en analytics" },
  { name: "Dienstverleners", id: "4", image: stockPhotos.dienstverlener, alt: "Professionele dienstverlening" },
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
    <section className="relative py-20 md:py-28">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl font-bold text-gray-900 md:text-5xl"
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
              className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md md:min-h-[6rem]"
              style={{ willChange: "transform" }}
            >
              <div className="relative -mx-8 -mt-8 aspect-[16/10] w-[calc(100%+4rem)] shrink-0 overflow-hidden bg-indigo-50">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
              </div>
              <div className="flex flex-1 items-center justify-center pt-8">
                <span className="text-center text-xl font-semibold text-gray-900">
                  {card.name}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
