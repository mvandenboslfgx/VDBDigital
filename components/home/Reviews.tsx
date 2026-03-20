"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";

const REVIEWS = [
  {
    name: "Lisa van der Berg",
    company: "Studio Lisa",
    role: "Eigenaar",
    text: "Onze website scoort nu veel beter. Duidelijke adviezen en snel resultaat.",
    stars: 5,
    logo: null,
  },
  {
    name: "Mark Jansen",
    company: "Jansen Digital",
    role: "Marketing",
    text: "De AI-audit gaf ons precies de punten die we nodig hadden. Top tool.",
    stars: 5,
    logo: null,
  },
  {
    name: "Sophie de Vries",
    company: "De Vries Design",
    role: "Creative director",
    text: "Eindelijk inzicht in wat er echt toe doet voor conversie. Aanrader.",
    stars: 5,
    logo: null,
  },
  {
    name: "Thomas Bakker",
    company: "Bakker & Partners",
    role: "Directeur",
    text: "Professionele analyse en heldere rapporten. We werken nu structureel met de tips.",
    stars: 5,
    logo: null,
  },
  {
    name: "Emma Mulder",
    company: "Mulder Media",
    role: "SEO specialist",
    text: "Snel, betrouwbaar en de resultaten kloppen. Ideaal voor onze klanten.",
    stars: 5,
    logo: null,
  },
];

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5 text-indigo-600" aria-label={`${stars} van 5 sterren`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < stars ? "opacity-100" : "opacity-30"}>
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({
  name,
  company,
  role,
  text,
  stars,
}: (typeof REVIEWS)[0]) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
      <StarRating stars={stars} />
      <p className="mt-3 line-clamp-3 text-base text-gray-700">&ldquo;{text}&rdquo;</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">
            {role} · {company}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="overflow-hidden py-20 md:py-28" aria-labelledby="reviews-heading">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="section-container text-center"
      >
        <h2 id="reviews-heading" className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Wat klanten zeggen
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xl text-gray-500">
          Ondernemers en marketeers die hun website laten analyseren.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="relative mt-10"
      >
        <div className="flex animate-marquee gap-6 overflow-hidden">
          {[...REVIEWS, ...REVIEWS].map((review, i) => (
            <ReviewCard key={`${review.name}-${i}`} {...review} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
