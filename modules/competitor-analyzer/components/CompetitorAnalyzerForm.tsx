"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CompetitorAnalysisResult } from "../types";

type Props = {
  onResult: (result: CompetitorAnalysisResult) => void;
};

export function CompetitorAnalyzerForm({ onResult }: Props) {
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/competitor-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, city }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Analyse mislukt. Probeer opnieuw.");
      }
      const data = (await res.json()) as { result: CompetitorAnalysisResult };
      onResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onverwachte fout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7 shadow-[0_26px_80px_rgba(0,0,0,0.9)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
        AI Competitor Analyzer
      </p>
      <h2 className="mt-3 text-lg font-semibold text-white">
        Vergelijk je markt op SEO en design.
      </h2>
      <p className="mt-2 text-xs text-gray-300">
        Vul sector en regio in. Ontvang een overzicht van typische concurrentie, SEO-niveau en kansen.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs text-gray-200">
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-300">Sector / branche</label>
          <input
            className="input-base"
            placeholder="Bijv. installatie, advocatuur, horeca"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-300">Stad / regio</label>
          <input
            className="input-base"
            placeholder="Bijv. Rotterdam, Randstad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <motion.button
          type="submit"
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="btn-primary mt-3 w-full"
        >
          {isSubmitting ? "Analyseren..." : "Start competitor-analyse"}
        </motion.button>
      </form>
    </section>
  );
}

export default CompetitorAnalyzerForm;
