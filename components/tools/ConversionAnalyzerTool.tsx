"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";

export default function ConversionAnalyzerTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    analysis: {
      ctaClarity?: string;
      trustSignals?: string;
      pageStructure?: string;
      formOptimization?: string;
      improvements?: string[];
    };
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
      const res = await fetch("/api/ai/conversion-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Mislukt.");
        return;
      }
      setResult({ url: data.url, analysis: data.analysis ?? {} });
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
          <label htmlFor="conv-url" className="text-label text-zinc-500">
            Website-URL
          </label>
          <Input
            id="conv-url"
            type="url"
            placeholder="https://voorbeeld.nl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Analyseren…" : "Analyseer conversie"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <>
          <ResultPanel title="CTA &amp; helderheid">
            <p className="text-sm text-zinc-300">{result.analysis.ctaClarity}</p>
          </ResultPanel>
          <ResultPanel title="Vertrouwenselementen">
            <p className="text-sm text-zinc-300">{result.analysis.trustSignals}</p>
          </ResultPanel>
          <ResultPanel title="Paginastructuur">
            <p className="text-sm text-zinc-300">{result.analysis.pageStructure}</p>
          </ResultPanel>
          <ResultPanel title="Formulieroptimalisatie">
            <p className="text-sm text-zinc-300">{result.analysis.formOptimization}</p>
          </ResultPanel>
          {result.analysis.improvements && result.analysis.improvements.length > 0 && (
            <ResultPanel title="Verbeterpunten">
              <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
                {result.analysis.improvements.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </ResultPanel>
          )}
        </>
      )}
    </div>
  );
}
