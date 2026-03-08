"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { getScoreColorHex } from "@/lib/scoreColor";

export interface ScoreBreakdownProps {
  totalScore: number;
  scores: {
    seoScore: number;
    perfScore: number;
    uxScore: number;
    convScore: number;
  };
  className?: string;
}

const CATEGORIES = [
  { key: "seoScore", label: "SEO", color: "#4F46E5" },
  { key: "perfScore", label: "Performance", color: "#7C3AED" },
  { key: "uxScore", label: "UX", color: "#059669" },
  { key: "convScore", label: "Conversie", color: "#0D9488" },
] as const;

function AnimatedBar({ score, label, color }: { score: number; label: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 600;
    const start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setWidth(start + (score - start) * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, score]);

  const barColor = color || getScoreColorHex(score);

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-600">{Math.round(width)}/100</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${score}%` } : { width: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

export default function ScoreBreakdown({ totalScore, scores, className = "" }: ScoreBreakdownProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ringRef, { once: true, margin: "-30px" });
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 800;
    const start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setDisplayScore(Math.round(start + (totalScore - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, totalScore]);

  const dim = 120;
  const stroke = 10;
  const r = (dim - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (totalScore / 100) * circumference;
  const ringColor = getScoreColorHex(totalScore);

  const bars = useMemo(
    () =>
      CATEGORIES.map(({ key, label, color }) => ({
        label,
        score: scores[key as keyof typeof scores] ?? 0,
        color,
      })),
    [scores]
  );

  return (
    <div className={`space-y-8 ${className}`}>
      <div ref={ringRef} className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
          style={{ width: dim, height: dim }}
        >
          <svg width={dim} height={dim} className="-rotate-90">
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={r}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={stroke}
            />
            <motion.circle
              cx={dim / 2}
              cy={dim / 2}
              r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-900"
            style={{ fontSize: "1.5rem" }}
          >
            {displayScore}
          </div>
        </motion.div>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-slate-500">
          Totaalscore
        </p>
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Per categorie
        </h3>
        <div className="space-y-4">
          {bars.map(({ label, score, color }) => (
            <AnimatedBar key={label} score={score} label={label} color={color} />
          ))}
        </div>
      </div>
    </div>
  );
}
