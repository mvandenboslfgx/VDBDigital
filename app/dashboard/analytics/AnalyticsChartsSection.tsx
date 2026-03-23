"use client";

import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(() => import("./AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] rounded-xl border border-white/[0.06] bg-[#111113] animate-pulse" />
  ),
});

export function AnalyticsChartsSection({ data }: { data: { label: string; count: number }[] }) {
  return <AnalyticsCharts data={data} />;
}
