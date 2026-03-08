"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { FunnelGeneratorResult } from "../types";

type Props = {
  onResult: (result: FunnelGeneratorResult) => void;
};

export function FunnelBuilderForm({ onResult }: Props) {
  const [businessType, setBusinessType] = useState("");
  const [offer, setOffer] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/funnel-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          offer: offer || undefined,
          targetAudience: targetAudience || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Genereren mislukt. Probeer opnieuw.");
      }
      const data = (await res.json()) as { result: FunnelGeneratorResult };
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
        AI Funnel Builder
      </p>
      <h2 className="mt-3 text-lg font-semibold text-white">
        Genereer landingspagina, offer en e-mailfunnel.
      </h2>
      <p className="mt-2 text-xs text-gray-300">
        Beschrijf je type bedrijf en optioneel je aanbod of doelgroep. Ontvang een complete funnel-structuur.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs text-gray-200">
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-300">Type bedrijf</label>
          <input
            className="input-base"
            placeholder="Bijv. B2B SaaS, loodgieter, coach"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-300">Aanbod (optioneel)</label>
          <input
            className="input-base"
            placeholder="Bijv. gratis audit, demo, whitepaper"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-300">Doelgroep (optioneel)</label>
          <input
            className="input-base"
            placeholder="Bijv. MKB, starters, vastgoed"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
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
          {isSubmitting ? "Genereren..." : "Genereer funnel"}
        </motion.button>
      </form>
    </section>
  );
}

export default FunnelBuilderForm;
