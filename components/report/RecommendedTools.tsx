"use client";

import Image from "next/image";
import type { RelevantAd } from "@/lib/ads";

interface RecommendedToolsProps {
  ad: RelevantAd;
  metric: string;
}

export function RecommendedTools({ ad, metric }: RecommendedToolsProps) {
  const clickUrl = `/api/ads/click?adId=${encodeURIComponent(ad.id)}`;

  return (
    <section
      className="mt-8 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-amber-500/5 p-6"
      aria-labelledby="recommended-tools-heading"
    >
      <h2 id="recommended-tools-heading" className="text-sm font-medium uppercase tracking-wider text-zinc-500">
        Aanbevolen partner voor {metric}
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Gesponsorde aanbeveling — kan helpen je score te verbeteren
      </p>
      <a
        href={clickUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-indigo-500/30 hover:bg-white/[0.06] sm:flex-row sm:items-center"
      >
        {ad.image && (
          <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-32">
            <Image
              src={ad.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 128px"
              unoptimized
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">{ad.companyName ?? ad.title}</p>
          <p className="mt-1 text-sm text-zinc-400">{ad.description}</p>
          <span className="mt-2 inline-block text-xs text-indigo-400">
            {ad.ctaText} →
          </span>
        </div>
      </a>
    </section>
  );
}
