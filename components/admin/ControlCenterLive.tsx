"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/admin/MetricCard";
import Link from "next/link";
import type { ControlCenterLiveData, ActivityItem } from "@/app/api/admin/control-center/live/route";

const POLL_INTERVAL_MS = 12_000;

interface ControlCenterLiveProps {
  initialData?: ControlCenterLiveData | null;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return "zojuist";
  if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)} min geleden`;
  if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)} u geleden`;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function ActivityRow({ item }: { item: ActivityItem }) {
  if (item.type === "scan") {
    return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
            Scan
          </span>
          <span className="truncate text-sm text-white">{item.domain}</span>
          {item.score != null && (
            <span className="shrink-0 text-xs text-zinc-500">Score {item.score}/100</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-zinc-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "user") {
    return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-600 text-xs font-medium">
            User
          </span>
          <span className="truncate text-sm text-white">{item.email}</span>
          <span className="shrink-0 text-xs text-zinc-500">Plan: {item.plan}</span>
        </div>
        <span className="shrink-0 text-xs text-zinc-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "payment") {
    return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium">
            €
          </span>
          <span className="text-sm text-white">€{item.amount.toFixed(2)}</span>
          {item.email && (
            <span className="truncate text-xs text-zinc-500">{item.email}</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-zinc-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "ai") {
    return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium">
            AI
          </span>
          <span className="truncate text-sm text-white">{item.tool}</span>
        </div>
        <span className="shrink-0 text-xs text-zinc-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "lead") {
    return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-medium">
            Lead
          </span>
          <span className="truncate text-sm text-white">{item.email}</span>
          <span className="shrink-0 text-xs text-zinc-500">{item.source}</span>
        </div>
        <span className="shrink-0 text-xs text-zinc-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  return null;
}

export default function ControlCenterLive({ initialData }: ControlCenterLiveProps) {
  const [data, setData] = useState<ControlCenterLiveData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/admin/control-center/live", { credentials: "include" });
        if (!res.ok) {
          setError("Kon gegevens niet laden");
          return;
        }
        const json = await res.json();
        setData(json);
        setError(null);
      } catch {
        setError("Netwerkfout");
      } finally {
        setLoading(false);
      }
    }

    fetchLive();
    const interval = setInterval(fetchLive, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 rounded-lg bg-white/10 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Control Center</h1>
          <p className="mt-1 text-sm text-gray-400">
            Live platformoverzicht. Vernieuwt automatisch.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden
          />
          Laatst bijgewerkt: {formatTime(data.timestamp)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Actieve gebruikers" value={data.activeUsers} />
        <MetricCard label="Scans vandaag" value={data.scansToday} />
        <MetricCard label="Rapporten vandaag" value={data.reportsToday} />
        <MetricCard
          label="Omzet vandaag"
          value={`€${data.revenueToday.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`}
        />
        <MetricCard
          label="Omzet deze maand"
          value={`€${data.revenueMonth.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`}
        />
        <MetricCard
          label="MRR"
          value={`€${data.mrr.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`}
        />
        <MetricCard label="AI-aanvragen vandaag" value={data.aiRequestsToday} />
        <MetricCard
          label="AI-kosten vandaag"
          value={`€${data.aiCostToday.toFixed(4)}`}
          subtext="Geschat uit tokens"
        />
        <MetricCard label="Nieuwe gebruikers vandaag" value={data.newUsersToday} />
        <MetricCard label="Nieuwe leads vandaag" value={data.newLeadsToday} />
        <MetricCard
          label="Systeemstatus"
          value={data.platformStatus.toUpperCase()}
          status={data.platformStatus}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Recente activiteit
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Scans, nieuwe gebruikers, betalingen, AI-gebruik en leads
          </p>
          <div className="mt-4 max-h-[420px] overflow-y-auto">
            {data.activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Nog geen activiteit</p>
            ) : (
              <div className="divide-y divide-white/5">
                {data.activity.map((item) => (
                  <ActivityRow key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Snel naar
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/admin/site"
              className="rounded-lg bg-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              Site Beheer (alles)
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Producten
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Gebruikers
            </Link>
            <Link
              href="/admin/leads"
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Leads
            </Link>
            <Link
              href="/admin/betalingen"
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Betalingen
            </Link>
            <Link
              href="/admin/finance"
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Financiën
            </Link>
            <Link
              href="/admin/ai-usage"
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              AI-gebruik
            </Link>
            <Link
              href="/admin/system"
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Systeemstatus
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
