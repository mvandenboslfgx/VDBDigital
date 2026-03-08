"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";

export default function ContentGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    metaTitle?: string;
    metaDescription?: string;
    headings?: string[];
    article?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!topic.trim()) {
      setError("Vul een onderwerp in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/content-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
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
          <label htmlFor="topic" className="text-label text-zinc-500">
            Onderwerp
          </label>
          <Input
            id="topic"
            type="text"
            placeholder="bijv. Hoe verhoog ik mijn conversie?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-2"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Genereren…" : "Genereer content"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <>
          {(result.metaTitle || result.metaDescription) && (
            <ResultPanel title="SEO meta">
              {result.metaTitle && (
                <p className="text-sm">
                  <span className="text-zinc-500">Title: </span>
                  <span className="text-zinc-300">{result.metaTitle}</span>
                </p>
              )}
              {result.metaDescription && (
                <p className="mt-2 text-sm">
                  <span className="text-zinc-500">Description: </span>
                  <span className="text-zinc-300">{result.metaDescription}</span>
                </p>
              )}
            </ResultPanel>
          )}
          {result.headings && result.headings.length > 0 && (
            <ResultPanel title="Koppen">
              <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
                {result.headings.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </ResultPanel>
          )}
          {result.article && (
            <ResultPanel title="Blogartikel">
              <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-headings:text-white">
                <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300">
                  {result.article}
                </pre>
              </div>
            </ResultPanel>
          )}
        </>
      )}
    </div>
  );
}
