"use client";

import { useMemo } from "react";
import { getScoreColorHex } from "@/lib/scoreColor";

export interface ImprovementSimulationProps {
  currentScore: number;
  /** Estimated score if critical issues are fixed (default: current + 22, capped at 85). */
  potentialScore?: number;
  criticalCount?: number;
  className?: string;
}

export default function ImprovementSimulation({
  currentScore,
  potentialScore,
  criticalCount = 0,
  className = "",
}: ImprovementSimulationProps) {
  const estimated = useMemo(() => {
    if (potentialScore != null) return Math.min(100, potentialScore);
    const fromCritical = criticalCount * 8;
    return Math.min(85, Math.round(currentScore + fromCritical));
  }, [currentScore, potentialScore, criticalCount]);

  const currentHex = getScoreColorHex(currentScore);
  const potentialHex = getScoreColorHex(estimated);

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-saas-card ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Verbeterpotentieel
      </h3>
      <p className="mt-1 text-slate-600">
        Na het oplossen van de kritieke punten kan uw score naar schatting stijgen.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-8">
        <div>
          <p className="text-xs font-medium text-slate-500">Huidige score</p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color: currentHex }}
          >
            {currentScore}
          </p>
        </div>
        <div className="text-slate-400">→</div>
        <div>
          <p className="text-xs font-medium text-slate-500">Potentiële score</p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color: potentialHex }}
          >
            {estimated}
          </p>
        </div>
      </div>
      {estimated > currentScore && (
        <p className="mt-4 text-sm text-slate-600">
          Geschat +{estimated - currentScore} punten door kritieke verbeterpunten aan te pakken.
        </p>
      )}
    </div>
  );
}
