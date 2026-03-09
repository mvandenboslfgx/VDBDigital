"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { RelevantAd } from "@/lib/ads";

const METRIC_ICONS: Record<string, string> = {
  SEO: "🔍",
  PERF: "⚡",
  UX: "✨",
  CONV: "📈",
};

interface RecommendedStackProps {
  ads: RelevantAd[];
  lowestMetricLabel: string;
}

export function RecommendedStack({ ads, lowestMetricLabel }: RecommendedStackProps) {
  if (!ads.length) return null;

  return (
    <section
      className="mt-8 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg shadow-slate-200/50 dark:border-slate-700/50 dark:from-slate-800/80 dark:to-slate-900/80 dark:shadow-slate-900/50"
      aria-labelledby="recommended-stack-heading"
    >
      <h2 id="recommended-stack-heading" className="text-lg font-semibold text-slate-900 dark:text-white">
        Aanbevolen tools
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Omdat je score laag was op {lowestMetricLabel} — deze partners kunnen helpen.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad, i) => (
          <RecommendedStackCard key={ad.id} ad={ad} index={i} />
        ))}
      </div>
    </section>
  );
}

function RecommendedStackCard({ ad, index }: { ad: RelevantAd; index: number }) {
  const clickUrl = `/api/ads/click?adId=${encodeURIComponent(ad.id)}`;
  const icon = METRIC_ICONS[ad.targetMetric] ?? "🔗";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-600/50 dark:bg-slate-800/40"
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="relative mb-3 h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700/50">
          {ad.image ? (
            <Image
              src={ad.image}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl" aria-hidden>
              {icon}
            </span>
          )}
        </div>
        <p className="font-medium text-slate-900 dark:text-white">
          {ad.companyName ?? ad.title}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {ad.description}
        </p>
        <a
          href={clickUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-fit items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 group-hover:shadow-md"
        >
          Bekijk Tool →
        </a>
      </div>
    </motion.div>
  );
}
