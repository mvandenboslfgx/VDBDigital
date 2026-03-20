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
      ? "border-rose-200 bg-rose-50"
      : status === "warning"
        ? "border-amber-200 bg-amber-50"
        : "border-gray-200 bg-white";

  const statusDot =
    status === "error"
      ? "bg-rose-500"
      : status === "warning"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${statusColor} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${statusDot}`} aria-hidden />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
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
            <span className="text-sm text-gray-500">{subtext}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
