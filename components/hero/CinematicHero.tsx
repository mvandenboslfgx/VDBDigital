"use client";

import dynamic from "next/dynamic";
import ArchitectGrid from "@/components/background/ArchitectGrid";
import SignatureHeadline from "@/components/hero/SignatureHeadline";

const CinematicGrid = dynamic(
  () => import("@/components/background/CinematicGrid"),
  { ssr: false }
);

export default function CinematicHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0F14]">
      <ArchitectGrid />
      <CinematicGrid />

      <div className="relative z-10 max-w-4xl px-6 text-center">
        <SignatureHeadline />
        <p className="mt-6 text-lg text-neutral-400">
          Strategie, ontwerp en automatisering samengebracht in één
          gecontroleerd digitaal systeem.
        </p>
      </div>
    </section>
  );
}

