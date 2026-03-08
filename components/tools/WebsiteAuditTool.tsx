"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";
import TechnicalDataSection, { type TechnicalDataSummary } from "./TechnicalDataSection";
import ScoreBreakdown from "@/components/audit/ScoreBreakdown";
import ImprovementSimulation from "@/components/audit/ImprovementSimulation";

type Scores = {
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
};

export default function WebsiteAuditTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const raw = url.trim();
    if (!raw) {
      setError("Vul een website-URL in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw, preview: true }),
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
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
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
          <label htmlFor="audit-url" className="text-sm font-medium text-slate-700">
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
            <ResultPanel title="Scores">
              <ScoreBreakdown
                totalScore={avg}
                scores={result.scores}
                className="rounded-2xl border border-saas-border bg-saas-surface p-6 shadow-saas-card"
              />
            </ResultPanel>

            <ResultPanel title="Contentkwaliteit (signalen)">
              {result.signals && (
                <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
                  {result.signals.title && (
                    <li>Title: {result.signals.title.slice(0, 80)}…</li>
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

            <ResultPanel title="AI-advies">
              <div className="whitespace-pre-wrap text-sm text-slate-600">
                {result.summary && result.summary.trim().length > 0
                  ? result.summary
                  : "Op basis van onze analyse hebben we verschillende verbeterpunten gevonden die de prestaties van uw website kunnen verhogen."}
              </div>
            </ResultPanel>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-saas-card md:p-8">
              <h3 className="text-lg font-semibold text-slate-900">
                Uw website score: {avg}/100
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Op basis van onze analyse hebben we verschillende verbeterpunten gevonden die de prestaties van uw website kunnen verhogen.
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">Belangrijkste aandachtspunten:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-slate-600">
                {(result.issues?.length ? result.issues.slice(0, 5).map((i) => i.message) : (() => {
                  const bullets = result.summary
                    .split(/\n|•|\./)
                    .map((s) => s.trim())
                    .filter((s) => s.length > 10)
                    .slice(0, 4);
                  return bullets.length > 0 ? bullets : [
                    "SEO- en technische verbeterpunten",
                    "Performance en laadsnelheid",
                    "UX en conversie-optimalisatie",
                    "Concreet actieplan",
                  ];
                })()).map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>

              <ImprovementSimulation
                currentScore={avg}
                criticalCount={result.issues?.filter((i) => i.severity === "critical").length ?? 0}
                className="mt-8"
              />

              <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                <p className="font-semibold text-indigo-700">
                  Ontgrendel het volledige rapport
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Krijg toegang tot een uitgebreide analyse met concrete verbeterpunten voor SEO, gebruikerservaring en conversieoptimalisatie.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {[
                    "Volledige SEO analyse",
                    "UX verbeterpunten",
                    "Conversie optimalisatie",
                    "Technische fouten",
                    "Prioriteitenlijst",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-slate-500" aria-hidden>🔒</span> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/prijzen" className="mt-5 inline-block">
                  <Button size="lg" className="w-full sm:w-auto">
                    Upgrade naar Pro
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
              >
                Scan opnieuw
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
