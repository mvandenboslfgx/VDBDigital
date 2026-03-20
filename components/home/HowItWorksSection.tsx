"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { stockPhotos } from "@/lib/stock-photos";

const steps = [
  { num: "1", title: "Vul je website in", desc: "Voer je URL in en start direct je scan.", image: stockPhotos.stepWebsite, alt: "Website invoeren" },
  { num: "2", title: "Wij analyseren je site", desc: "We beoordelen SEO, snelheid, UX en conversie.", image: stockPhotos.stepAI, alt: "Website analyse" },
  { num: "3", title: "Je krijgt direct verbeterpunten", desc: "Heldere acties met prioriteit, zodat je direct kunt verbeteren.", image: stockPhotos.stepReport, alt: "Verbeterpunten rapport" },
];

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-gray-900 md:text-5xl"
        >
          Hoe het werkt
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xl text-gray-500"
        >
          Klaar in 5 minuten.
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
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <div className="relative -mx-8 -mt-8 aspect-video w-[calc(100%+4rem)] bg-indigo-50">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200 bg-indigo-600 text-sm font-semibold text-white shadow">
                  {step.num}
                </span>
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-base text-gray-500">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
