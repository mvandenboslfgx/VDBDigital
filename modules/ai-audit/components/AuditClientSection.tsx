"use client";

import { useState } from "react";
import type { AuditResult as AuditResultType } from "../types";
import AuditForm from "./AuditForm";
import AuditResult from "./AuditResult";

export function AuditClientSection() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResultType | null>(null);

  return (
    <section className="section-container py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] items-start">
        <AuditForm
          onResult={({ url, result }) => {
            setActiveUrl(url);
            setResult(result);
          }}
        />
        {activeUrl && result && (
          <AuditResult url={activeUrl} result={result} />
        )}
        {!activeUrl && (
          <div className="hidden rounded-3xl border border-white/10 bg-black/70 p-6 text-xs text-gray-300 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Live audit canvas
            </p>
            <p className="mt-3">
              Start met een domein links. Hier verschijnt vervolgens een
              compact, strategisch rapport dat je direct kunt gebruiken tijdens
              adviesgesprekken of interne reviews.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AuditClientSection;

