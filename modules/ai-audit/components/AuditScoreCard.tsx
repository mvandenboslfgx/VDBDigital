import type React from "react";
import { motion } from "framer-motion";

type Props = {
  score: number;
  url: string;
};

export function AuditScoreCard({ score, url }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tier =
    clamped >= 85 ? "Studio-ready" : clamped >= 70 ? "Solid base" : "High impact potential";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-3xl border border-white/10 bg-black/80 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.9)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
        AI WEBSITE AUDIT
      </p>
      <p className="mt-2 text-xs text-gray-400 break-all">{url}</p>
      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border border-gold/40 bg-black/80" />
          <div
            className="absolute inset-1 rounded-full bg-[conic-gradient(from_210deg,_#D4B76A_var(--percent),_rgba(17,24,39,0.7)_var(--percent))]"
            style={{ "--percent": `${clamped}%` } as React.CSSProperties}
          />
          <div className="absolute inset-3 rounded-full bg-black/95 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gold">{clamped}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{tier}</p>
          <p className="text-[11px] text-gray-400">
            Score is estimated based on structure, meta setup, and perceived
            performance. Use the insights below to guide high-impact upgrades.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default AuditScoreCard;

