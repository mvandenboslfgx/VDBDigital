"use client";

import { motion } from "framer-motion";
import ScoreRing from "@/components/ui/ScoreRing";
import { getScoreColorClass } from "@/lib/scoreColor";

type Scores = {
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
};

interface ScanResultPreviewProps {
  totalScore: number;
  scores: Scores;
  issues?: Array<{ severity: string; message: string }>;
  unlocked: boolean;
  summary?: string;
  recommendations?: string[];
  onUnlockClick: () => void;
  onReset: () => void;
  children?: React.ReactNode;
}

export default function ScanResultPreview({
  totalScore,
  scores,
  issues,
  unlocked,
  summary,
  recommendations,
  onUnlockClick,
  onReset,
  children,
}: ScanResultPreviewProps) {
  const topIssues = issues?.slice(0, 4) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900">Uw website score</h3>
        <p
          className={`mt-2 text-4xl font-bold md:text-5xl ${getScoreColorClass(totalScore, "text")}`}
        >
          {totalScore} <span className="text-2xl font-normal text-gray-500">/ 100</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-6">
          <ScoreRing score={scores.seoScore} label="SEO" size="sm" />
          <ScoreRing score={scores.perfScore} label="Performance" size="sm" />
          <ScoreRing score={scores.uxScore} label="UX" size="sm" />
          <ScoreRing score={scores.convScore} label="Conversie" size="sm" />
        </div>

        {topIssues.length > 0 && (
          <>
            <p className="mt-6 text-sm font-medium text-gray-700">Belangrijkste verbeterpunten</p>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
              {topIssues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5 text-indigo-500">{idx + 1}.</span>
                  {issue.message}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {!unlocked ? (
        <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-8 select-none" aria-hidden>
            <h4 className="font-semibold text-gray-900">AI-analyse en aanbevelingen</h4>
            <div className="mt-4 space-y-2">
              {[
                "Op basis van de scan zijn er 8 concrete verbeterpunten gevonden die uw",
                "De meta description ontbreekt op de belangrijkste pagina's waardoor uw",
                "De laadtijd van uw website is hoger dan het gemiddelde in uw branche",
                "Er zijn mogelijkheden om de conversieratio met 15-25% te verhogen door",
              ].map((line, i) => (
                <p key={i} className="text-sm text-gray-600">{line}...</p>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["SEO optimalisatie", "Snelheidsverbeteringen", "UX aanbevelingen", "Conversie tips", "Technische details"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="text-center px-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h4 className="mt-3 text-lg font-semibold text-gray-900">
                +5 inzichten verborgen
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Vul je e-mail in en ontgrendel direct het volledige rapport met alle aanbevelingen.
              </p>
              <button
                type="button"
                onClick={onUnlockClick}
                className="mt-4 rounded-xl bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.98]"
              >
                Ontgrendel volledig rapport
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {summary && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h4 className="font-semibold text-gray-900">AI-analyse</h4>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {summary}
              </div>
            </div>
          )}

          {recommendations && recommendations.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h4 className="font-semibold text-gray-900">Aanbevelingen</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500">&#10003;</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {children}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.98]"
        >
          Nieuwe scan
        </button>
        {!unlocked && (
          <button
            type="button"
            onClick={onUnlockClick}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-8 py-3 text-base font-medium text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.98]"
          >
            Volledig rapport
          </button>
        )}
      </div>
    </motion.div>
  );
}
