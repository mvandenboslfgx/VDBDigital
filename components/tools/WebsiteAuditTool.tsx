"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";
import type { TechnicalDataSummary } from "./TechnicalDataSection";
import ScoreBreakdown from "@/components/audit/ScoreBreakdown";
import ImprovementSimulation from "@/components/audit/ImprovementSimulation";
import EmailGatePopup from "@/components/scan/EmailGatePopup";
import { getScoreColorClass } from "@/lib/scoreColor";
import { isScanUnlocked, setScanUnlockCookie } from "@/lib/scanUnlock";

type Scores = {
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
};

export default function WebsiteAuditTool() {
  const CTA_CLASS =
    "bg-indigo-600 text-white px-8 py-4 text-lg rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95";
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    scores: Scores;
    summary: string;
    score?: number;
    totalScore?: number;
    scanConfidence?: number;
    technicalSummary?: TechnicalDataSummary;
    signals?: { title?: string; metaDescription?: string; h1Count?: number };
    issues?: Array<{ severity: string; message: string }>;
    recommendations?: string[];
  } | null>(null);

  useEffect(() => {
    if (isScanUnlocked()) setUnlocked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const raw = url.trim();
    if (!raw) {
      setError("Vul een website-URL in.");
      return;
    }
    const isAlreadyUnlocked = isScanUnlocked();
    setLoading(true);
    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw, preview: !isAlreadyUnlocked }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        score?: number;
        totalScore?: number;
        scores?: Scores;
        summary?: string;
        summaryShort?: string;
        url?: string;
        scanConfidence?: number;
        technicalSummary?: TechnicalDataSummary;
        signals?: { title?: string; metaDescription?: string; h1Count?: number };
        issues?: Array<{ severity: string; message: string }>;
        recommendations?: string[];
      };
      if (!res.ok || !data.success) {
        setError(data.message || "Scan mislukt. Probeer het opnieuw.");
        return;
      }
      const scores = data.scores!;
      const overall =
        data.score ??
        Math.round(
          (scores.seoScore + scores.perfScore + scores.uxScore + scores.convScore) / 4
        );
      setResult({
        url: data.url || raw,
        scores,
        summary: data.summary || data.summaryShort || "",
        score: overall,
        totalScore: data.totalScore ?? overall,
        scanConfidence: data.scanConfidence,
        technicalSummary: data.technicalSummary,
        signals: data.signals,
        issues: data.issues,
        recommendations: data.recommendations,
      });
      if (isAlreadyUnlocked) setUnlocked(true);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
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
      // Keep popup open for retry
    } finally {
      setUnlocking(false);
    }
  };

  const avg = useMemo(
    () =>
      result?.totalScore ??
      result?.score ??
      (result
        ? Math.round(
            (result.scores.seoScore +
              result.scores.perfScore +
              result.scores.uxScore +
              result.scores.convScore) /
              4
          )
        : 0),
    [result]
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="audit-url" className="text-sm font-medium text-gray-700">
            Website-URL
          </label>
          <Input
            id="audit-url"
            type="url"
            placeholder="https://voorbeeld.nl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Scannen…" : "Start scan"}
        </Button>
      </form>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-12"
        >
          <div className="flex gap-2">
            {["SEO", "Snelheid", "UX", "Conversie"].map((label, i) => (
              <motion.div
                key={label}
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700"
              >
                {label}…
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-gray-600">Analyse wordt uitgevoerd</p>
        </motion.div>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-gray-900">Website score</h2>
              <p className={`mt-2 text-4xl font-bold md:text-5xl ${getScoreColorClass(avg, "text")}`}>
                {avg} <span className="text-2xl font-normal text-gray-500">/ 100</span>
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Je website scoort {avg}/100. Op basis van deze scan verlies je waarschijnlijk 25-40% van je potentiële klanten.
              </p>
              <p className="mt-6 text-sm font-medium text-gray-700">Belangrijkste verbeterpunten</p>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                {(result.issues?.length ? result.issues.slice(0, 3).map((i) => i.message) : (() => {
                  const bullets = result.summary
                    .split(/\n|•|\./)
                    .map((s) => s.trim())
                    .filter((s) => s.length > 10)
                    .slice(0, 3);
                  return bullets.length > 0 ? bullets : [
                    "Meta description ontbreekt",
                    "Website laadt traag",
                    "Call-to-action ontbreekt",
                  ];
                })()).map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">{i + 1}.</span> {text}
                  </li>
                ))}
              </ul>

              <ImprovementSimulation
                currentScore={avg}
                criticalCount={result.issues?.filter((i) => i.severity === "critical").length ?? 0}
                className="mt-8"
              />

              {!unlocked && (
                <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
                  <h3 className="text-base font-semibold text-gray-900">Ontgrendel het volledige rapport</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600">
                    {[
                      "volledige AI-analyse",
                      "alle SEO aanbevelingen",
                      "UX verbeterpunten",
                      "conversie optimalisatie",
                      "technische details",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="text-gray-500" aria-hidden>&#10003;</span> {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowGate(true)}
                    className={`mt-5 ${CTA_CLASS} w-full sm:w-auto`}
                  >
                    Ontgrendel met e-mail
                  </button>
                </div>
              )}
            </div>

            <ResultPanel title="Scores">
              <ScoreBreakdown
                totalScore={avg}
                scores={result.scores}
                className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm"
              />
            </ResultPanel>

            <ResultPanel title="Contentkwaliteit (signalen)">
              {result.signals && (
                <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600">
                  {result.signals.title && (
                    <li>Title: {result.signals.title.slice(0, 80)}...</li>
                  )}
                  {result.signals.metaDescription && (
                    <li>Meta description aanwezig</li>
                  )}
                  {result.signals.h1Count != null && (
                    <li>H1-tags: {result.signals.h1Count}</li>
                  )}
                </ul>
              )}
            </ResultPanel>

            {unlocked ? (
              <>
                <ResultPanel title="AI-advies">
                  <div className="whitespace-pre-wrap text-sm text-gray-600">
                    {result.summary && result.summary.trim().length > 0
                      ? result.summary
                      : "Op basis van onze analyse hebben we verschillende verbeterpunten gevonden die de prestaties van uw website kunnen verhogen."}
                  </div>
                </ResultPanel>
                {result.recommendations && result.recommendations.length > 0 && (
                  <ResultPanel title="Aanbevelingen">
                    <ul className="space-y-2 text-sm text-gray-600">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 text-emerald-500">&#10003;</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </ResultPanel>
                )}
              </>
            ) : (
              <div className="relative rounded-2xl border border-gray-200 bg-surface shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 select-none" aria-hidden>
                  <h3 className="font-semibold text-gray-900">AI-advies</h3>
                  <div className="mt-3 space-y-2">
                    {[
                      "Op basis van de scan zijn er 8 concrete verbeterpunten gevonden die uw",
                      "De meta description ontbreekt op de belangrijkste pagina's waardoor uw",
                      "De laadtijd van uw website is hoger dan het gemiddelde in uw branche",
                    ].map((line, i) => (
                      <p key={i} className="text-sm text-gray-600">{line}...</p>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
                  <p className="text-sm font-medium text-gray-700">AI-advies en aanbevelingen zijn vergrendeld</p>
                  <button
                    type="button"
                    onClick={() => setShowGate(true)}
                    className="mt-3 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow transition hover:bg-indigo-700"
                  >
                    Ontgrendel met e-mail
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className={CTA_CLASS}
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
              >
                Scan opnieuw
              </Button>
              {unlocked && (
                <Link href="/contact?intent=call" className="inline-block">
                  <Button size="lg" className={CTA_CLASS}>Plan gratis call</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailGatePopup
        open={showGate}
        onClose={() => setShowGate(false)}
        onSubmit={handleUnlock}
        loading={unlocking}
      />
    </div>
  );
}
