"use client";

import { useMemo } from "react";

export interface StatsChartDataPoint {
  label: string;
  value: number;
}

export interface StatsChartProps {
  title: string;
  data: StatsChartDataPoint[];
  valueFormat?: (n: number) => string;
  className?: string;
  /** Optional: show conversion rate as secondary line/style */
  subtitle?: string;
}

export default function StatsChart({
  title,
  data,
  valueFormat = (n) => String(n),
  className = "",
  subtitle,
}: StatsChartProps) {
  const max = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data]
  );

  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/40 p-4 ${className}`}
    >
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {title}
      </h4>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      )}
      <div className="mt-4 flex items-end gap-2">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span className="text-xs text-gray-500">
              {valueFormat(d.value)}
            </span>
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${(d.value / max) * 120}px`,
                minHeight: d.value > 0 ? "8px" : "0",
                background: `linear-gradient(to top, rgba(198,169,93,0.4), rgba(198,169,93,0.8))`,
              }}
            />
            <span className="text-[10px] text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
