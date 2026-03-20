"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";
import { stockPhotos } from "@/lib/stock-photos";

const MOCK_SCORES = [
  { label: "SEO", value: 78 },
  { label: "Perf", value: 72 },
  { label: "UX", value: 84 },
  { label: "Conv", value: 69 },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function HeroSection() {
  const CTA_CLASS =
    "bg-indigo-600 text-white px-8 py-4 text-lg rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95";
  const router = useRouter();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      const query = new URLSearchParams({ url: trimmed }).toString();
      router.push(`/website-scan?${query}`);
    } else {
      router.push("/website-scan");
    }
  };

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden px-4 py-20 md:py-28">
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.06),transparent_50%)]"
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
            className="max-w-3xl mx-auto text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl lg:mx-0"
          >
            Verdien meer met je website - binnen 5 minuten
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
            className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-gray-600"
          >
            Ontdek waarom je bezoekers niet converteren en krijg direct concrete verbeteringen die je omzet verhogen.
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
                placeholder="https://jouwdomein.nl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-gray-900 text-base shadow-sm placeholder:text-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Website-URL"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button
                type="submit"
                size="lg"
                className={`${CTA_CLASS} min-h-[52px] w-full sm:w-auto`}
              >
                Ontdek wat mijn website kost →
              </Button>
            </motion.div>
          </motion.form>
          <p className="mt-3 text-sm text-gray-500">Geen account nodig • Resultaat in 5 minuten</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-1 text-sm text-gray-600"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="text-indigo-600 font-medium">✓</span> Geen technische kennis nodig
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-indigo-600 font-medium">✓</span> Direct toepasbare verbeteringen
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-indigo-600 font-medium">✓</span> Binnen 5 minuten resultaat
            </span>
          </motion.p>
          <p className="mt-4 text-sm text-gray-600">Gebruikt door 100+ bedrijven • Gemiddeld +20-40% conversie verbetering</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: easeOut }}
          className="hidden lg:flex flex-col gap-6"
          style={{ willChange: "transform" }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
            <Image
              src={stockPhotos.hero}
              alt="Website analyse op laptop - VDB Digital"
              width={600}
              height={400}
              sizes="(max-width: 1024px) 0px, 600px"
              className="-mx-8 -mt-8 h-48 w-[calc(100%+4rem)] object-cover transition-transform duration-500 hover:scale-105"
              unoptimized
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" aria-hidden />
          </div>
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)" }}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
          >
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Voorbeeld analyse</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">voorbeeld.nl</p>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {MOCK_SCORES.map((s) => (
              <ScoreRing key={s.label} score={s.value} label={s.label} size="sm" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {["Recente scans", "AI-adviezen", "Verbeterpunten"].map((t) => (
              <div key={t} className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2">
                <p className="text-xs font-medium text-gray-600">{t}</p>
              </div>
            ))}
          </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
