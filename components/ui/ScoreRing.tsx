"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { getScoreColorHex } from "@/lib/scoreColor";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: 64, md: 88, lg: 112 };
const strokeMap = { sm: 6, md: 8, lg: 10 };

export default function ScoreRing({
  score,
  label,
  size = "md",
  className = "",
}: ScoreRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setDisplayScore(Math.round(safeScore * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, safeScore]);

  const dim = sizeMap[size];
  const stroke = strokeMap[size];
  const r = (dim - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (safeScore / 100) * circumference;
  const color = getScoreColorHex(safeScore);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={"flex flex-col items-center " + className}
    >
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-slate-900 drop-shadow-sm"
          style={{ fontSize: size === "lg" ? "1.5rem" : size === "md" ? "1.25rem" : "1rem" }}
        >
          {isInView ? displayScore : safeScore}
        </div>
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
    </motion.div>
  );
}
