"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";

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

export default function WebsiteScanSection({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    setUrl((prev) => (initialUrl && !prev ? initialUrl : prev));
  }, [initialUrl]);
  const [stepIndex, setStepIndex] = useState(0);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setScanning(true);
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((i) => {
        if (i >= STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setScanning(false);
            window.location.href = "/create-account?redirect=/dashboard/audits";
          }, 600);
          return i;
        }
        return i + 1;
      });
    }, 800);
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
            className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300"
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
              {!scanning ? (
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
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto sm:min-w-[220px] min-h-14 px-8 py-4 text-lg font-medium"
                  >
                    Start gratis website-analyse
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm max-w-2xl mx-auto"
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
                            animate={{
                              width: i <= stepIndex ? "100%" : "0%",
                            }}
                            transition={{
                              duration: 0.6,
                              ease: [0.16, 1, 0.3, 1],
                            }}
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
                  <p className="mt-6 text-base text-slate-600">
                    Account aanmaken om het volledige rapport te bekijken…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-lg text-slate-600">
            Gratis account. Geen creditcard. 1 scan per maand op het gratis plan.
          </p>
        </div>
      </div>
    </section>
  );
}
