"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  status?: "ok" | "warning" | "error";
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  trend,
  status,
  className = "",
}: MetricCardProps) {
  const statusColor =
    status === "error"
      ? "border-red-500/30 bg-red-500/5"
      : status === "warning"
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-white/[0.06] bg-[#111113]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 shadow-panel ${statusColor} ${className}`}
    >
      <p className="text-label text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {value}
      </p>
      {(subtext || trend) && (
        <div className="mt-2 flex items-center gap-2">
          {trend === "up" && (
            <span className="text-xs font-medium text-emerald-400">↑</span>
          )}
          {trend === "down" && (
            <span className="text-xs font-medium text-amber-400">↓</span>
          )}
          {subtext && (
            <span className="text-sm text-zinc-500">{subtext}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
