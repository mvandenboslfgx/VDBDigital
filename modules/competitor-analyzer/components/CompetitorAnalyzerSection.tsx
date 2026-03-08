"use client";

import { useState } from "react";
import type { CompetitorAnalysisResult } from "../types";
import CompetitorAnalyzerForm from "./CompetitorAnalyzerForm";
import CompetitorResult from "./CompetitorResult";

export function CompetitorAnalyzerSection() {
  const [result, setResult] = useState<CompetitorAnalysisResult | null>(null);

  return (
    <section className="section-container py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] items-start">
        <CompetitorAnalyzerForm onResult={setResult} />
        {result ? (
          <CompetitorResult result={result} />
        ) : (
          <div className="hidden rounded-3xl border border-white/10 bg-black/70 p-6 text-xs text-gray-300 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Live resultaat
            </p>
            <p className="mt-3">
              Vul links sector en regio in. Hier verschijnt een overzicht van concurrentie, SEO en kansen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CompetitorAnalyzerSection;
