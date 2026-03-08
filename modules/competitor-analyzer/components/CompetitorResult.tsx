"use client";

import { motion } from "framer-motion";
import type { CompetitorAnalysisResult } from "../types";

type Props = {
  result: CompetitorAnalysisResult;
};

export function CompetitorResult({ result }: Props) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        Resultaat
      </p>

      {result.topCompetitors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Top concurrenten</h3>
          <ul className="mt-3 space-y-3">
            {result.topCompetitors.map((c, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-black/60 p-4"
              >
                <p className="font-semibold text-white">{c.name}</p>
                {c.url && (
                  <p className="text-[11px] text-gray-400 truncate">{c.url}</p>
                )}
                <p className="mt-1 text-[11px] text-gold">SEO: {c.seoScore}/100 · {c.designQuality}</p>
                {c.strengths?.length > 0 && (
                  <p className="mt-2 text-[11px] text-gray-300">
                    Sterktes: {c.strengths.join(", ")}
                  </p>
                )}
                {c.gaps?.length > 0 && (
                  <p className="text-[11px] text-gray-400">
                    Gaps: {c.gaps.join(", ")}
                  </p>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {result.seoComparison.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">SEO-vergelijking</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-gray-300">
            {result.seoComparison.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {result.designQualitySummary && (
        <p className="text-xs text-gray-300">{result.designQualitySummary}</p>
      )}

      {result.marketingGaps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Marketinggaps</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-gray-300">
            {result.marketingGaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gold">Aanbevelingen</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-gray-300">
            {result.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CompetitorResult;
