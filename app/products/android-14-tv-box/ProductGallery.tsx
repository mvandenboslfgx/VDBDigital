"use client";

import { useState } from "react";
import Image from "next/image";

const IMAGES = [
  "/products/tvbox1.jpg",
  "/products/tvbox2.jpg",
  "/products/tvbox3.jpg",
  "/products/tvbox4.jpg",
];

const PLACEHOLDER = "/products/placeholder.svg";

export function ProductGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());

  const mainSrc = failed.has(activeIndex) ? PLACEHOLDER : IMAGES[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-slate-50">
        <Image
          src={mainSrc}
          alt={`Android 14 Smart TV Box 8K - afbeelding ${activeIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
          priority
          onError={() => setFailed((prev) => new Set(prev).add(activeIndex))}
        />
      </div>
      {/* Thumbnails - scroll on small screens */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
        {IMAGES.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              activeIndex === i
                ? "border-indigo-600 ring-2 ring-indigo-600/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-label={`Bekijk afbeelding ${i + 1}`}
          >
            <Image
              src={failed.has(i) ? PLACEHOLDER : src}
              alt=""
              fill
              sizes="80px"
              className="object-contain p-1"
              onError={() => setFailed((prev) => new Set(prev).add(i))}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
