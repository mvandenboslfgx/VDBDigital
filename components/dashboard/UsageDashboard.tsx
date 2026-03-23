"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import DashboardWidget from "@/components/ui/DashboardWidget";
import type { UsageStatsCard } from "@/lib/usage-dashboard-stats";

type Props = {
  /** When set (server-rendered), skips client fetch — faster first paint. */
  initialStats?: UsageStatsCard | null;
};

export function UsageDashboard({ initialStats = null }: Props) {
  const [stats, setStats] = useState<UsageStatsCard | null>(initialStats);

  useEffect(() => {
    if (initialStats) return;
    fetch("/api/usage/stats")
      .then((res) => res.json())
      .then((data) => data.stats && setStats(data.stats))
      .catch(() => {});
  }, [initialStats]);

  if (!stats) {
    return (
      <DashboardWidget title="Gebruik deze maand" subtitle="Scans, rapporten en AI-tools">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-slate-50/80 px-4 py-3 animate-pulse">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-6 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </DashboardWidget>
    );
  }

  const scansLabel = stats.scansLimit != null
    ? `${stats.scansUsed} / ${stats.scansLimit} scans`
    : `${stats.scansUsed} scans`;
  const aiLabel = stats.aiLimit != null
    ? `${stats.aiUsage} / ${stats.aiLimit} AI-aanroepen`
    : `${stats.aiUsage} AI-aanroepen`;

  return (
    <DashboardWidget
      title="Gebruik deze maand"
      subtitle="Scans, rapporten en AI-tools"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Scans gebruikt"
          value={scansLabel}
          subtext="Website-audits"
        />
        <MetricCard
          label="Rapporten"
          value={String(stats.reportsGenerated)}
          subtext="Gegenereerde rapporten"
        />
        <MetricCard
          label="AI-gebruik"
          value={aiLabel}
          subtext="Deze maand"
        />
      </div>
    </DashboardWidget>
  );
}
