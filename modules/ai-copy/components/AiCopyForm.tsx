"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CopyResult } from "../types";

type Props = {
  onResult: (payload: { inputSummary: string; result: CopyResult }) => void;
};

export function AiCopyForm({ onResult }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("Kalm, scherp, premium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industry,
          city,
          toneOfVoice,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(
          data?.message ?? "Kon geen AI-copy genereren. Probeer opnieuw."
        );
      }

      const data = (await res.json()) as {
        inputSummary: string;
        result: CopyResult;
      };

      onResult({ inputSummary: data.inputSummary, result: data.result });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Onverwachte fout tijdens het genereren van copy."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7 shadow-[0_26px_80px_rgba(0,0,0,0.9)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
        AI Copy Studio
      </p>
      <h2 className="mt-3 text-lg font-semibold text-white">
        Genereer merkcopy in één take.
      </h2>
      <p className="mt-2 text-xs text-gray-300">
        Beschrijf het merk en de toon. Ideaal voor landingspagina&apos;s,
        conceptpresentaties en snelle iteraties.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 text-xs text-gray-200"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-gray-300">
              Bedrijfsnaam
            </label>
            <input
              className="input-base"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-gray-300">
              Sector
            </label>
            <input
              className="input-base"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Bijv. brandingstudio, installatiebedrijf, SaaS"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-gray-300">
              Stad / regio
            </label>
            <input
              className="input-base"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bijv. Rotterdam, Randstad, NL"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-gray-300">
              Tone of voice
            </label>
            <input
              className="input-base"
              value={toneOfVoice}
              onChange={(e) => setToneOfVoice(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <motion.button
          type="submit"
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="btn-primary mt-3 w-full"
        >
          {isSubmitting ? "Copy wordt gegenereerd..." : "Genereer AI-copy"}
        </motion.button>
      </form>
    </section>
  );
}

export default AiCopyForm;

