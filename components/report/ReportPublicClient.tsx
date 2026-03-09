"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";
import { ShareButtons } from "./ShareButtons";
import TechnicalDataSection from "@/components/tools/TechnicalDataSection";

interface Improvement {
  text?: string;
  aiFix?: string;
}

export interface TechnicalDataSummary {
  h1Count: number;
  h2Count: number;
  imagesMissingAlt: number;
  imageCount: number;
  internalLinks: number;
  externalLinks: number;
  canonicalPresent: boolean;
  metaDescriptionPresent: boolean;
  metaDescriptionLength: number;
  viewportPresent: boolean;
  structuredDataPresent: boolean;
  formCount: number;
  ctaCount: number;
  wordCount: number;
}

export interface ReportPublicClientProps {
  reportId: string;
  domain: string;
  score: number;
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
  topInsights: string[];
  fullSummary: string;
  improvements: Improvement[];
  technicalData?: TechnicalDataSummary | null;
  scanConfidence?: number | null;
}

export function ReportPublicClient({
  reportId,
  domain,
  score,
  seoScore,
  perfScore,
  uxScore,
  convScore,
  topInsights,
  fullSummary,
  improvements,
  technicalData,
  scanConfidence,
}: ReportPublicClientProps) {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Vul je e-mailadres in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/report/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kon rapport niet ontgrendelen.");
        return;
      }
      setUnlocked(true);
    } catch {
      setError("Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="section-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Website-audit: {domain}
          </h1>
          <p className="mt-2 text-zinc-500">
            Score {score}/100 · Bekijk de belangrijkste inzichten
          </p>

          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#111113] p-8">
            <p className="text-label text-zinc-500">Totaalscore</p>
            <p className="mt-2 text-4xl font-semibold text-white md:text-5xl">
              {score} <span className="text-2xl text-zinc-500">/ 100</span>
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <ScoreRing score={seoScore} label="SEO" size="md" />
              <ScoreRing score={perfScore} label="Performance" size="md" />
              <ScoreRing score={uxScore} label="UX" size="md" />
              <ScoreRing score={convScore} label="Conversie" size="md" />
            </div>
          </div>

          <section id="analysis" className="mt-8 rounded-2xl border border-white/[0.06] bg-[#111113] p-6" aria-labelledby="analysis-heading">
            <h2 id="analysis-heading" className="text-lg font-semibold text-white">Analyse</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {topInsights.map((line, i) => (
                <li key={i}>{line.replace(/^[-*]\s*/, "")}</li>
              ))}
            </ul>
          </section>

          <ShareButtons shareUrl={shareUrl} domain={domain} score={score} />

          {!unlocked ? (
            <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
              <h2 className="text-lg font-semibold text-white">
                Volledig rapport bekijken
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Vul je e-mailadres in om het volledige rapport met alle aanbevelingen te ontgrendelen.
              </p>
              <form onSubmit={handleUnlock} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="report-email" className="sr-only">
                    E-mail
                  </label>
                  <Input
                    id="report-email"
                    type="email"
                    placeholder="jouw@email.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Bezig…" : "Rapport ontgrendelen"}
                </Button>
              </form>
              {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              )}
            </div>
          ) : (
            <>
              <div className="mt-10 rounded-2xl border border-white/[0.06] bg-[#111113] p-8">
                <h2 className="text-lg font-semibold text-white">
                  Volledige samenvatting
                </h2>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-zinc-300 leading-relaxed">
                  {fullSummary}
                </pre>
              </div>
              {technicalData && typeof technicalData === "object" && "h1Count" in technicalData && (
                <section id="technical-insights" className="mt-8" aria-labelledby="technical-heading">
                  <h2 id="technical-heading" className="sr-only">Technische inzichten</h2>
                  <TechnicalDataSection
                    data={technicalData as ComponentProps<typeof TechnicalDataSection>["data"]}
                    scanConfidence={scanConfidence ?? undefined}
                  />
                </section>
              )}
              {improvements.length > 0 && (
                <section id="recommendations" className="mt-8 rounded-2xl border border-white/[0.06] bg-[#111113] p-8" aria-labelledby="recommendations-heading">
                  <h2 id="recommendations-heading" className="text-lg font-semibold text-white">
                    Aanbevelingen
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {improvements.map((item, i) => (
                      <li key={i} className="rounded-lg border border-white/5 p-4">
                        <p className="text-sm text-zinc-300">
                          {(item as { text?: string }).text ?? String(item)}
                        </p>
                        {(item as { aiFix?: string }).aiFix && (
                          <p className="mt-2 text-xs text-amber-400/90">
                            Fix: {(item as { aiFix?: string }).aiFix}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          <nav className="mt-12 flex flex-wrap justify-center gap-4 text-center text-sm text-zinc-500" aria-label="Gerelateerde links">
            <a href="/tools/website-audit" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
              Scan je eigen website
            </a>
            <a href="/kennis/seo" className="hover:text-zinc-300">Lees over SEO</a>
            <a href="/seo/website-analyse" className="hover:text-zinc-300">Website analyse uitleg</a>
            <a href="/" className="hover:text-zinc-300">VDB Digital</a>
          </nav>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Gegenereerd met VDB Digital
          </p>
        </div>
      </div>
    </div>
  );
}
