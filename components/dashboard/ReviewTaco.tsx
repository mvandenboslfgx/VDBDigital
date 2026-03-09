"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const REVIEWS = [
  { name: "Lisa van der Berg", company: "Studio Lisa", text: "Duidelijke adviezen en snel resultaat.", stars: 5 },
  { name: "Mark Jansen", company: "Jansen Digital", text: "Precies de punten die we nodig hadden. Top tool.", stars: 5 },
  { name: "Sophie de Vries", company: "De Vries Design", text: "Eindelijk inzicht in wat er toe doet voor conversie.", stars: 5 },
  { name: "Thomas Bakker", company: "Bakker & Partners", text: "Professionele analyse en heldere rapporten.", stars: 5 },
  { name: "Emma Mulder", company: "Mulder Media", text: "Snel, betrouwbaar. Ideaal voor onze klanten.", stars: 5 },
];

export function ReviewTaco() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 py-6" aria-labelledby="review-taco-heading">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="px-4"
      >
        <p id="review-taco-heading" className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
          Wat anderen zeggen
        </p>
        <div className="flex animate-marquee gap-4 overflow-hidden">
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className="flex w-[280px] shrink-0 flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className={j < r.stars ? "opacity-100" : "opacity-30"}>★</span>
                ))}
              </div>
              <p className="line-clamp-2 text-xs text-slate-600">&ldquo;{r.text}&rdquo;</p>
              <p className="text-xs font-medium text-midnight">{r.name}</p>
              <p className="text-xs text-slate-500">{r.company}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
