"use client";

import { useState } from "react";
import Image from "next/image";
import { stockPhotos } from "@/lib/stock-photos";

const PLACEHOLDER_SVG = "/images/cases/de-elektricien-placeholder.svg";
const LOCAL_PREVIEW = stockPhotos.caseStudyPreview;

export default function CasePreview({
  alt,
  liveUrl,
}: {
  url: string;
  alt: string;
  liveUrl: string;
  placeholderSrc?: string;
  localSrc?: string;
}) {
  const [useFallback, setUseFallback] = useState(false);

  const imgSrc = useFallback ? PLACEHOLDER_SVG : LOCAL_PREVIEW;

  return (
    <div className="relative flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-b-3xl bg-indigo-50">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="h-full w-full object-cover object-top"
        priority
        onError={() => setUseFallback(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      <a
        href={liveUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-indigo-700"
      >
        Open volledige site
      </a>
    </div>
  );
}
