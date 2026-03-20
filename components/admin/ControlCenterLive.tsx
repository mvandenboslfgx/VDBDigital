"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/admin/MetricCard";
import Link from "next/link";
import Image from "next/image";
import type { ControlCenterLiveData, ActivityItem } from "@/app/api/admin/control-center/live/route";

const POLL_INTERVAL_MS = 20_000;

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
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
            Scan
          </span>
          <span className="truncate text-sm text-gray-900">{item.domain}</span>
          {item.score != null && (
            <span className="shrink-0 text-xs text-gray-500">Score {item.score}/100</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-gray-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "user") {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium">
            User
          </span>
          <span className="truncate text-sm text-gray-900">{item.email}</span>
          <span className="shrink-0 text-xs text-gray-500">Plan: {item.plan}</span>
        </div>
        <span className="shrink-0 text-xs text-gray-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "payment") {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium">
            €
          </span>
          <span className="text-sm text-gray-900">€{item.amount.toFixed(2)}</span>
          {item.email && (
            <span className="truncate text-xs text-gray-500">{item.email}</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-gray-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "ai") {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700 text-xs font-medium">
            AI
          </span>
          <span className="truncate text-sm text-gray-900">{item.tool}</span>
        </div>
        <span className="shrink-0 text-xs text-gray-500">{formatTime(item.createdAt)}</span>
      </div>
    );
  }
  if (item.type === "lead") {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 text-xs font-medium">
            Lead
          </span>
          <span className="truncate text-sm text-gray-900">{item.email}</span>
          <span className="shrink-0 text-xs text-gray-500">{item.source}</span>
        </div>
        <span className="shrink-0 text-xs text-gray-500">{formatTime(item.createdAt)}</span>
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
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 left-10 h-32 w-32 rounded-full bg-violet-200/40 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Live Operations</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Owner Control Center</h1>
            <p className="mt-1 text-sm text-gray-600">
              Live platformoverzicht met operationele signalen in realtime.
            </p>
          </div>
          <Image
            src="/logo-vdb.png"
            alt="VDB Digital"
            width={140}
            height={44}
            className="h-10 w-auto object-contain"
            priority
          />
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden
            />
            Laatst bijgewerkt: {formatTime(data.timestamp)}
          </div>
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
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Recente activiteit
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Scans, nieuwe gebruikers, betalingen, AI-gebruik en leads
          </p>
          <div className="mt-4 min-h-[200px] max-h-[480px] overflow-y-auto">
            {data.activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">Nog geen activiteit</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.activity.map((item) => (
                  <ActivityRow key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Snel naar
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/admin/site"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              Site Beheer (alles)
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50"
            >
              Producten
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50"
            >
              Gebruikers
            </Link>
            <Link
              href="/admin/leads"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50"
            >
              Leads
            </Link>
            <Link
              href="/admin/betalingen"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50"
            >
              Betalingen
            </Link>
            <Link
              href="/admin/finance"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50"
            >
              Financiën
            </Link>
            <Link
              href="/admin/ai-usage"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50"
            >
              AI-gebruik
            </Link>
            <Link
              href="/admin/system"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50"
            >
              Systeemstatus
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
