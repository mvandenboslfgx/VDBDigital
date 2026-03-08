"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";

export default function CopyOptimizerTool() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    improvedCopy?: string;
    headlines?: string[];
    ctas?: string[];
    readabilityTips?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!text.trim()) {
      setError("Plak de te optimaliseren tekst.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/copy-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-label text-zinc-500">Tekst om te optimaliseren</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Plak hier je copy…"
            rows={6}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Optimaliseren…" : "Optimaliseer copy"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <>
          {result.improvedCopy && (
            <ResultPanel title="Verbeterde copy">
              <div className="whitespace-pre-wrap text-sm text-zinc-300">
                {result.improvedCopy}
              </div>
            </ResultPanel>
          )}
          {result.headlines && result.headlines.length > 0 && (
            <ResultPanel title="Headline-alternatieven">
              <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
                {result.headlines.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </ResultPanel>
          )}
          {result.ctas && result.ctas.length > 0 && (
            <ResultPanel title="CTA-voorstellen">
              <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
                {result.ctas.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </ResultPanel>
          )}
          {result.readabilityTips && (
            <ResultPanel title="Leesbaarheid">
              <p className="text-sm text-zinc-300">{result.readabilityTips}</p>
            </ResultPanel>
          )}
        </>
      )}
    </div>
  );
}
