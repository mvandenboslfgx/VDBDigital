"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";
import ScanResultPreview from "@/components/scan/ScanResultPreview";
import EmailGatePopup from "@/components/scan/EmailGatePopup";
import { isScanUnlocked, setScanUnlockCookie } from "@/lib/scanUnlock";

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
  const CTA_CLASS =
    "bg-indigo-600 text-white px-8 py-4 text-lg rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95";
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
  const [unlocked, setUnlocked] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    setUrl((prev) => (initialUrl && !prev ? initialUrl : prev));
  }, [initialUrl]);

  useEffect(() => {
    if (isScanUnlocked()) setUnlocked(true);
  }, []);

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

    const isAlreadyUnlocked = isScanUnlocked();

    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, preview: !isAlreadyUnlocked }),
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
      if (isAlreadyUnlocked) setUnlocked(true);
    } catch {
      setError("Verbinding mislukt. Controleer je internet en probeer het opnieuw.");
    } finally {
      setScanning(false);
    }
  };

  const handleUnlock = async (email: string, name: string) => {
    setUnlocking(true);
    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          preview: false,
          email,
          name: name || undefined,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        summary?: string;
        recommendations?: string[];
        issues?: Array<{ severity: string; message: string }>;
        scores?: Scores;
        totalScore?: number;
      };

      if (data.success) {
        setScanUnlockCookie(email);
        setUnlocked(true);
        setShowGate(false);
        if (data.summary) {
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  summary: data.summary || prev.summary,
                  recommendations: data.recommendations ?? prev.recommendations,
                  issues: data.issues ?? prev.issues,
                  scores: data.scores ?? prev.scores,
                  totalScore: data.totalScore ?? prev.totalScore,
                }
              : prev
          );
        }
      }
    } catch {
      // Unlock failed silently; popup stays open for retry
    } finally {
      setUnlocking(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <section id="website-scan" className="relative py-20 md:py-28">
      <div className="section-container">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Controleer direct de prestaties van uw website
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-4 max-w-2xl text-center text-xl text-gray-500"
          >
            Vul uw URL in. We analyseren SEO, performance, UX en conversie en tonen een concreet verbeterplan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
            className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
          >
            <p className="text-center text-sm font-medium text-gray-500">Voorbeeld scores</p>
            <div className="mt-6 flex flex-wrap justify-center gap-8">
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
                  className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end"
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
                    className={`${CTA_CLASS} min-h-14 w-full sm:min-w-[220px] sm:w-auto`}
                  >
                    {scanning ? "Scannen…" : "Start gratis website-analyse"}
                  </Button>
                </motion.form>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <ScanResultPreview
                    totalScore={result.totalScore}
                    scores={result.scores}
                    issues={result.issues}
                    unlocked={unlocked}
                    summary={result.summary}
                    recommendations={result.recommendations}
                    onUnlockClick={() => setShowGate(true)}
                    onReset={handleReset}
                  />
                </div>
              )}
            </AnimatePresence>

            {scanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto mt-6 max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-base font-medium text-gray-500">
                    Analyseren van {url.replace(/^https?:\/\//, "").slice(0, 30)}…
                  </span>
                </div>
                <div className="space-y-4">
                  {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div
                        className={`h-2 max-w-md flex-1 overflow-hidden rounded-full bg-gray-200 ${
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
                          i <= stepIndex ? "text-gray-900" : "text-gray-500"
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
              <div className="mt-4 rounded-xl border border-gray-200 bg-indigo-50 p-4 text-center">
                <p className="text-sm font-medium text-gray-700">{error}</p>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-lg text-gray-500">
            Gratis preview. Vul je e-mail in voor het volledige rapport met AI-advies.
          </p>
        </div>
      </div>

      <EmailGatePopup
        open={showGate}
        onClose={() => setShowGate(false)}
        onSubmit={handleUnlock}
        loading={unlocking}
      />
    </section>
  );
}
