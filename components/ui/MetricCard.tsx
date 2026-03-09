"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function MetricCard({
  label,
  value,
  subtext,
  trend,
  className = "",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={
        "rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm " +
        className
      }
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        {value}
      </p>
      {(subtext || trend) && (
        <div className="mt-2 flex items-center gap-2">
          {trend === "up" && (
            <span className="text-xs font-medium text-emerald-600">↑</span>
          )}
          {trend === "down" && (
            <span className="text-xs font-medium text-amber-600">↓</span>
          )}
          {subtext && (
            <span className="text-sm text-slate-500">{subtext}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
