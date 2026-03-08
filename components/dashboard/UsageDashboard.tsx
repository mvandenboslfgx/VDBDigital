"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import DashboardWidget from "@/components/ui/DashboardWidget";

interface UsageStats {
  scansUsed: number;
  scansLimit: number | null;
  reportsGenerated: number;
  aiUsage: number;
  aiLimit: number | null;
}

export function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    fetch("/api/usage/stats")
      .then((res) => res.json())
      .then((data) => data.stats && setStats(data.stats))
      .catch(() => {});
  }, []);

  if (!stats) return null;

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
