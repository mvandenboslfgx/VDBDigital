"use client";

import { useState } from "react";

const PLACEHOLDER_SVG = "/images/cases/de-elektricien-placeholder.svg";
const LOCAL_PREVIEW = "/images/cases/de-elektricien-preview.png";

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
    <div className="relative flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-b-3xl bg-[#0a0a0a]">
      <img
        src={imgSrc}
        alt={alt}
        className="h-full w-full object-cover object-top"
        loading="eager"
        onError={() => setUseFallback(true)}
      />
      <a
        href={liveUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 btn-primary text-xs shadow-lg"
      >
        Open volledige site
      </a>
    </div>
  );
}
