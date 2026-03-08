"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import ResultPanel from "./ResultPanel";

type Keyword = { keyword: string; intent: string; contentSuggestion: string };

export default function SeoKeywordFinderTool() {
  const [website, setWebsite] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ keywords: Keyword[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!website.trim() && !keyword.trim()) {
      setError("Vul een website-URL of keyword in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/seo-keyword-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: website.trim() || undefined, keyword: keyword.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Mislukt.");
        return;
      }
      setResult({ keywords: data.keywords ?? [] });
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
          <label className="text-label text-zinc-500">Website-URL (optioneel)</label>
          <Input
            type="url"
            placeholder="https://voorbeeld.nl"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="text-label text-zinc-500">Of keyword</label>
          <Input
            type="text"
            placeholder="bijv. marketing automation"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="mt-2"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Zoeken…" : "Vind keywords"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <ResultPanel title="Keyword-ideeën">
          <ul className="space-y-4">
            {result.keywords.map((k, i) => (
              <li key={i} className="rounded-lg border border-white/5 p-4">
                <p className="font-medium text-white">{k.keyword}</p>
                <p className="mt-1 text-xs text-amber-400/90">{k.intent}</p>
                <p className="mt-2 text-sm text-zinc-400">{k.contentSuggestion}</p>
              </li>
            ))}
          </ul>
        </ResultPanel>
      )}
    </div>
  );
}
