"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";

export default function CompetitorAnalyzerTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    seo?: string;
    content?: string;
    ux?: string;
    conversion?: string;
    advantages?: string[];
    improvements?: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!url.trim()) {
      setError("Vul de website-URL van de concurrent in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/competitor-website", {
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
          <label htmlFor="comp-url" className="text-label text-zinc-500">
            Website concurrent
          </label>
          <Input
            id="comp-url"
            type="url"
            placeholder="https://concurrent.nl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Analyseren…" : "Analyseer concurrent"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <>
          <ResultPanel title="SEO">
            <p className="text-sm text-zinc-300">{result.seo}</p>
          </ResultPanel>
          <ResultPanel title="Content">
            <p className="text-sm text-zinc-300">{result.content}</p>
          </ResultPanel>
          <ResultPanel title="UX">
            <p className="text-sm text-zinc-300">{result.ux}</p>
          </ResultPanel>
          <ResultPanel title="Conversie">
            <p className="text-sm text-zinc-300">{result.conversion}</p>
          </ResultPanel>
          {result.advantages && result.advantages.length > 0 && (
            <ResultPanel title="Sterke punten">
              <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
                {result.advantages.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </ResultPanel>
          )}
          {result.improvements && result.improvements.length > 0 && (
            <ResultPanel title="Verbeterpunten">
              <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
                {result.improvements.map((i, j) => (
                  <li key={j}>{i}</li>
                ))}
              </ul>
            </ResultPanel>
          )}
        </>
      )}
    </div>
  );
}
