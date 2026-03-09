"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";
import { getScoreColorClass } from "@/lib/scoreColor";

const STEPS = [
  { id: "seo", label: "SEO controleren…" },
  { id: "perf", label: "Performance analyseren…" },
  { id: "ux", label: "UX controleren…" },
  { id: "conv", label: "Conversie analyseren…" },
];

const EXAMPLE_SCORES = [
  { label: "SEO", value: 74 },
  { label: "Performance", value: 61 },
  { label: "UX", value: 82 },
  { label: "Conversie", value: 69 },
];

type Scores = { seoScore: number; perfScore: number; uxScore: number; convScore: number };

export default function WebsiteScanSection({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [scanning, setScanning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    scores: Scores;
    totalScore: number;
    summary: string;
    issues?: Array<{ severity: string; message: string }>;
    recommendations?: string[];
  } | null>(null);

  useEffect(() => {
    setUrl((prev) => (initialUrl && !prev ? initialUrl : prev));
  }, [initialUrl]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Vul een website-URL in.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Voeg https:// toe aan de URL (bijv. https://uwwebsite.nl).");
      return;
    }
    setScanning(true);
    setStepIndex(0);
    setError(null);
    setResult(null);

    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i >= STEPS.length - 1 ? i : i + 1));
    }, 800);

    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, preview: true }),
      });
      clearInterval(stepInterval);
      setStepIndex(STEPS.length - 1);

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        scores?: Scores;
        totalScore?: number;
        summary?: string;
        issues?: Array<{ severity: string; message: string }>;
        recommendations?: string[];
      };

      if (!res.ok || !data.success) {
        setError(data.message || "Scan mislukt. Controleer de URL en probeer het opnieuw.");
        setScanning(false);
        return;
      }

      const scores = data.scores!;
      const totalScore =
        data.totalScore ??
        Math.round(
          (scores.seoScore + scores.perfScore + scores.uxScore + scores.convScore) / 4
        );

      setResult({
        scores,
        totalScore,
        summary: data.summary || "",
        issues: data.issues,
        recommendations: data.recommendations,
      });
    } catch {
      setError("Verbinding mislukt. Controleer je internet en probeer het opnieuw.");
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <section id="website-scan" className="relative py-28">
      <div className="section-container">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl font-semibold text-slate-900 md:text-4xl text-center"
          >
            Controleer direct de prestaties van uw website
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto text-center"
          >
            Vul uw URL in. We analyseren SEO, performance, UX en conversie en tonen een concreet verbeterplan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
            className="mt-12 rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm transition-all duration-300"
          >
            <p className="text-center text-sm font-medium text-slate-500">Voorbeeld scores</p>
            <div className="mt-6 flex flex-wrap justify-center gap-8 md:gap-12">
              {EXAMPLE_SCORES.map((s) => (
                <ScoreRing key={s.label} score={s.value} label={s.label} size="md" />
              ))}
            </div>
          </motion.div>

          <div className="mt-14">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleScan}
                  className="flex flex-col gap-4 sm:flex-row sm:items-end max-w-2xl mx-auto"
                >
                  <div className="flex-1">
                    <Input
                      label="Website-URL"
                      type="url"
                      placeholder="https://uwwebsite.nl"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-14 text-base"
                      disabled={scanning}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={scanning}
                    className="w-full sm:w-auto sm:min-w-[220px] min-h-14 px-8 py-4 text-lg font-medium"
                  >
                    {scanning ? "Scannen…" : "Start gratis website-analyse"}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto space-y-6"
                >
                  <div className="rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">Uw website score</h3>
                    <p
                      className={`mt-2 text-4xl font-bold md:text-5xl ${getScoreColorClass(
                        result.totalScore,
                        "text"
                      )}`}
                    >
                      {result.totalScore}{" "}
                      <span className="text-2xl font-normal text-slate-500">/ 100</span>
                    </p>
                    <div className="mt-6 flex flex-wrap gap-6">
                      <ScoreRing
                        score={result.scores.seoScore}
                        label="SEO"
                        size="sm"
                      />
                      <ScoreRing
                        score={result.scores.perfScore}
                        label="Performance"
                        size="sm"
                      />
                      <ScoreRing
                        score={result.scores.uxScore}
                        label="UX"
                        size="sm"
                      />
                      <ScoreRing
                        score={result.scores.convScore}
                        label="Conversie"
                        size="sm"
                      />
                    </div>
                    {(result.issues?.length ?? 0) > 0 && (
                      <>
                        <p className="mt-6 text-sm font-medium text-slate-700">
                          Belangrijkste verbeterpunten
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                          {result.issues!.slice(0, 4).map((i, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-500 mt-0.5">•</span>
                              {i.message}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
                      <h4 className="font-semibold text-slate-900">
                        Ontgrendel het volledige rapport
                      </h4>
                      <p className="mt-2 text-sm text-slate-600">
                        Maak een gratis account aan voor het volledige rapport met alle
                        aanbevelingen, technische details en deelbare PDF.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href="/create-account?redirect=/dashboard/audits">
                          <Button size="lg">Gratis account aanmaken</Button>
                        </Link>
                        <Button variant="secondary" size="lg" onClick={handleReset}>
                          Nieuwe scan
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {scanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm max-w-2xl mx-auto"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-base font-medium text-slate-600">
                    Analyseren van {url.replace(/^https?:\/\//, "").slice(0, 30)}…
                  </span>
                </div>
                <div className="space-y-4">
                  {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div
                        className={`h-2 flex-1 max-w-md rounded-full bg-slate-100 overflow-hidden ${
                          i < stepIndex ? "opacity-60" : ""
                        }`}
                      >
                        <motion.div
                          className="h-full rounded-full bg-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: i <= stepIndex ? "100%" : "0%" }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium min-w-[220px] ${
                          i <= stepIndex ? "text-slate-900" : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-lg text-slate-600">
            Gratis account. Geen creditcard. 1 scan per maand op het gratis plan.
          </p>
        </div>
      </div>
    </section>
  );
}
