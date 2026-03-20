"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { RelevantAd } from "@/lib/ads";

interface AdBannerProps {
  ad: RelevantAd;
  metricLabel: string;
}

export function AdBanner({ ad, metricLabel }: AdBannerProps) {
  const clickUrl =
    ad.impressionId != null
      ? `/api/ads/click?adId=${encodeURIComponent(ad.id)}&impressionId=${encodeURIComponent(ad.impressionId)}&placement=${encodeURIComponent(ad.placement)}&ctx=${encodeURIComponent(ad.contextSig)}&creativeId=${encodeURIComponent(ad.creativeId)}`
      : `/api/ads/click?adId=${encodeURIComponent(ad.id)}&placement=${encodeURIComponent(ad.placement)}&ctx=${encodeURIComponent(ad.contextSig)}&creativeId=${encodeURIComponent(ad.creativeId)}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-8 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white shadow-lg shadow-slate-200/50 dark:border-slate-700/50 dark:from-slate-800/80 dark:to-slate-900/80 dark:shadow-slate-900/50"
      aria-labelledby="ad-banner-heading"
    >
      <div className="relative p-6">
        <span
          id="ad-banner-heading"
          className="inline-flex items-center rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200"
          aria-hidden
        >
          Gesponsord
        </span>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Aanbevolen voor {metricLabel}
        </p>
        <a
          href={clickUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 flex w-full flex-col gap-4 rounded-xl border border-slate-200/80 bg-white/60 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md dark:border-slate-600/50 dark:bg-slate-800/40 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/30 sm:flex-row sm:items-center"
        >
          {ad.image && (
            <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-32">
              <Image
                src={ad.image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 128px"
                unoptimized
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 dark:text-white">
              {ad.companyName ?? ad.title}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {ad.description}
            </p>
            <span className="mt-2 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {ad.ctaText} →
            </span>
          </div>
        </a>
      </div>
    </motion.section>
  );
}
