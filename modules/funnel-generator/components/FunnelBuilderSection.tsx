"use client";

import { useState } from "react";
import type { FunnelGeneratorResult } from "../types";
import FunnelBuilderForm from "./FunnelBuilderForm";
import FunnelResult from "./FunnelResult";

export function FunnelBuilderSection() {
  const [result, setResult] = useState<FunnelGeneratorResult | null>(null);

  return (
    <section className="section-container py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] items-start">
        <FunnelBuilderForm onResult={setResult} />
        {result ? (
          <FunnelResult result={result} />
        ) : (
          <div className="hidden rounded-3xl border border-white/10 bg-black/70 p-6 text-xs text-gray-300 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Funnel preview
            </p>
            <p className="mt-3">
              Vul links je bedrijfstype in. Hier verschijnt de landingspagina-structuur, offer, e-mailfunnel en ad-ideeën.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default FunnelBuilderSection;
