"use client";

import { useState } from "react";
import type { CopyResult } from "../types";
import AiCopyForm from "./AiCopyForm";
import AiCopyResult from "./AiCopyResult";

export function AiCopyClientSection() {
  const [inputSummary, setInputSummary] = useState<string | null>(null);
  const [result, setResult] = useState<CopyResult | null>(null);

  return (
    <section className="section-container py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] items-start">
        <AiCopyForm
          onResult={({ inputSummary, result }) => {
            setInputSummary(inputSummary);
            setResult(result);
          }}
        />
        {inputSummary && result ? (
          <AiCopyResult inputSummary={inputSummary} result={result} />
        ) : (
          <div className="hidden rounded-3xl border border-white/10 bg-black/70 p-6 text-xs text-gray-300 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Output canvas
            </p>
            <p className="mt-3">
              Vul links de merkparameters in. Hier verschijnt vervolgens een
              complete set pagina-secties die je direct kunt inzetten in het
              ontwerp of CMS.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AiCopyClientSection;

