"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AuditResult } from "../types";

type Props = {
  onResult: (payload: { url: string; result: AuditResult }) => void;
};

export function AuditForm({ onResult }: Props) {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email: email || undefined }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        const msg = data?.message ?? "Audit kon niet worden uitgevoerd. Probeer opnieuw.";
        if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.warn("[AI Audit] API error:", res.status, data ?? "geen body");
        }
        throw new Error(msg);
      }

      const data = (await res.json()) as {
        url: string;
        result: AuditResult;
      };

      onResult({ url: data.url, result: data.result });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Onverwachte fout tijdens het uitvoeren van de audit."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7 shadow-[0_26px_80px_rgba(0,0,0,0.9)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
        AI Website Audit
      </p>
      <h2 className="mt-3 text-lg font-semibold text-white">
        Scan elke website op kansen.
      </h2>
      <p className="mt-2 text-xs text-gray-300">
        Vul een live URL in en ontvang een strategisch rapport rond SEO, UX en
        performance. Optioneel kun je het rapport ook per mail ontvangen.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 text-xs text-gray-200"
      >
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-300">
            Website URL
          </label>
          <input
            className="input-base"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-300">
            E-mail voor rapport (optioneel)
          </label>
          <input
            className="input-base"
            type="email"
            placeholder="jij@bedrijf.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && (
          <div className="space-y-1">
            <p className="text-[11px] text-red-400">{error}</p>
            <p className="text-[11px] text-gray-500">
              Tip: probeer een eenvoudige URL (bijv. example.com) of controleer OPENAI_API_KEY in .env. Open F12 → Network om de exacte fout te zien.
            </p>
          </div>
        )}
        <motion.button
          type="submit"
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="btn-primary mt-3 w-full"
        >
          {isSubmitting ? "Audit wordt uitgevoerd..." : "Start AI audit"}
        </motion.button>
      </form>
    </section>
  );
}

export default AuditForm;

