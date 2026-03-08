"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";
import MetricCard from "@/components/ui/MetricCard";

export default function PerformanceCheckTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    score: number | null;
    lcp?: { value?: number; display?: string } | null;
    cls?: { value?: number; display?: string } | null;
    fid?: { value?: number; display?: string } | null;
    fcp?: { display?: string } | null;
    tbt?: { display?: string } | null;
    tips: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!url.trim()) {
      setError("Vul een website-URL in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/performance-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Mislukt.");
        return;
      }
      setResult(data);
    } catch {
      setError("Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="perf-url" className="text-label text-zinc-500">
            Website-URL
          </label>
          <Input
            id="perf-url"
            type="url"
            placeholder="https://voorbeeld.nl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Meten…" : "Performance check"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <>
          <ResultPanel title="Core Web Vitals">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {result.score != null && (
                <MetricCard label="Performance score" value={`${result.score} / 100`} />
              )}
              {result.lcp?.display && (
                <MetricCard label="LCP" value={result.lcp.display} subtext="Largest Contentful Paint" />
              )}
              {result.cls?.display && (
                <MetricCard label="CLS" value={result.cls.display} subtext="Cumulative Layout Shift" />
              )}
              {(result.fid?.display || result.fcp?.display) && (
                <MetricCard
                  label="FID / FCP"
                  value={result.fid?.display ?? result.fcp?.display ?? "—"}
                  subtext="First Input Delay / First Contentful Paint"
                />
              )}
            </div>
            {result.tbt?.display && (
              <p className="mt-4 text-sm text-zinc-400">Total Blocking Time: {result.tbt.display}</p>
            )}
          </ResultPanel>
          <ResultPanel title="Tips">
            <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
              {result.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </ResultPanel>
        </>
      )}
    </div>
  );
}
