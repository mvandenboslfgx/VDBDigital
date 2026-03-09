"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";

const MOCK_SCORES = [
  { label: "SEO", value: 78 },
  { label: "Perf", value: 72 },
  { label: "UX", value: 84 },
  { label: "Conv", value: 69 },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function HeroSection() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      router.push(`/website-scan${trimmed ? `?url=${encodeURIComponent(trimmed)}` : ""}`);
    } else {
      router.push("/website-scan");
    }
  };

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden px-4 py-28">
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.06),transparent_50%)]"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="section-container relative grid w-full max-w-6xl mx-auto gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <div className="text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            style={{ willChange: "transform" }}
            className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl max-w-3xl mx-auto lg:mx-0"
          >
            Ontdek waarom uw website geen klanten oplevert
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
            className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-slate-600"
          >
            Onze AI analyseert uw website op SEO, snelheid en conversie en laat direct zien wat u kunt verbeteren.
          </motion.p>
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-3 max-w-lg mx-auto lg:mx-0"
          >
            <motion.div className="w-full sm:flex-1" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                type="url"
                inputMode="url"
                placeholder="https://uwwebsite.nl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-surface px-4 py-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base transition-all"
                aria-label="Website-URL"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button
                type="submit"
                size="lg"
                className="min-h-[52px] w-full sm:w-auto px-8 py-4 text-lg font-medium"
              >
                Start gratis website scan
              </Button>
            </motion.div>
          </motion.form>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-1 text-sm text-slate-600"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="text-blue-600 font-medium">✓</span> Gratis analyse
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-blue-600 font-medium">✓</span> Geen account nodig
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-blue-600 font-medium">✓</span> Resultaat binnen 30 seconden
            </span>
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: easeOut }}
          whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)" }}
          className="hidden lg:block rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm transition-all duration-300"
          style={{ willChange: "transform" }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Voorbeeld analyse</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">voorbeeld.nl</p>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {MOCK_SCORES.map((s) => (
              <ScoreRing key={s.label} score={s.value} label={s.label} size="sm" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {["Recente scans", "AI-adviezen", "Verbeterpunten"].map((t) => (
              <div key={t} className="rounded-xl border border-gray-100 bg-slate-50/80 px-3 py-2">
                <p className="text-xs font-medium text-slate-600">{t}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
