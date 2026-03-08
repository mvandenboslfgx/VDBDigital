"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

type Tab = "marketing" | "landing" | "seo";

export default function AIToolsPanel() {
  const [tab, setTab] = useState<Tab>("marketing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketingResult, setMarketingResult] = useState<{
    marketingChannels: string[];
    campaignIdeas: string[];
    positioningAdvice: string;
  } | null>(null);
  const [landingResult, setLandingResult] = useState<{
    headline: string;
    subheadline: string;
    sections: string[];
    callToAction: string;
  } | null>(null);
  const [seoResult, setSeoResult] = useState<{
    seoScore: number;
    missingTags: string[];
    improvementSuggestions: string[];
  } | null>(null);

  const [businessDesc, setBusinessDesc] = useState("");
  const [productTopic, setProductTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  async function runMarketing() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/marketing-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessDescription: businessDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setMarketingResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function runLanding() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productOrTopic: productTopic,
          targetAudience: targetAudience || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setLandingResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function runSeo() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: websiteUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setSeoResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "marketing", label: "Marketing strategy" },
    { id: "landing", label: "Landing page" },
    { id: "seo", label: "SEO audit" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-gold/20 text-gold border border-gold/50"
                : "border border-white/10 bg-black/40 text-gray-400 hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
          {error}
        </div>
      )}

      {tab === "marketing" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Business description</label>
            <textarea
              value={businessDesc}
              onChange={(e) => setBusinessDesc(e.target.value)}
              placeholder="Describe your business, product, or target market..."
              rows={4}
              className="input-base mt-1 w-full max-w-xl"
            />
          </div>
          <Button size="md" onClick={runMarketing} disabled={loading}>
            {loading ? "Generating…" : "Generate strategy"}
          </Button>
          {marketingResult && (
            <div className="mt-6 space-y-4 rounded-2xl border border-gold/20 bg-gold/5 p-6">
              <div>
                <h3 className="text-sm font-semibold text-gold">Marketing channels</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-gray-300">
                  {marketingResult.marketingChannels.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gold">Campaign ideas</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-gray-300">
                  {marketingResult.campaignIdeas.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gold">Positioning advice</h3>
                <p className="mt-2 text-sm text-gray-300">{marketingResult.positioningAdvice}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "landing" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Product or topic</label>
            <input
              type="text"
              value={productTopic}
              onChange={(e) => setProductTopic(e.target.value)}
              placeholder="e.g. SaaS dashboard, fitness app"
              className="input-base mt-1 w-full max-w-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Target audience (optional)</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. small business owners"
              className="input-base mt-1 w-full max-w-md"
            />
          </div>
          <Button size="md" onClick={runLanding} disabled={loading}>
            {loading ? "Generating…" : "Generate landing page"}
          </Button>
          {landingResult && (
            <div className="mt-6 space-y-4 rounded-2xl border border-gold/20 bg-gold/5 p-6">
              <div>
                <h3 className="text-sm font-semibold text-gold">Headline</h3>
                <p className="mt-1 text-lg font-medium text-white">{landingResult.headline}</p>
              </div>
              {landingResult.subheadline && (
                <div>
                  <h3 className="text-sm font-semibold text-gold">Subheadline</h3>
                  <p className="mt-1 text-gray-300">{landingResult.subheadline}</p>
                </div>
              )}
              {landingResult.sections.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gold">Sections</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-300">
                    {landingResult.sections.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gold">Call to action</h3>
                <p className="mt-1 font-medium text-white">{landingResult.callToAction}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "seo" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="input-base mt-1 w-full max-w-md"
            />
          </div>
          <Button size="md" onClick={runSeo} disabled={loading}>
            {loading ? "Analyzing…" : "Run SEO audit"}
          </Button>
          {seoResult && (
            <div className="mt-6 space-y-4 rounded-2xl border border-gold/20 bg-gold/5 p-6">
              <div>
                <h3 className="text-sm font-semibold text-gold">SEO score</h3>
                <p className="mt-1 text-2xl font-semibold text-white">{seoResult.seoScore}/100</p>
              </div>
              {seoResult.missingTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gold">Missing or weak</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-gray-300">
                    {seoResult.missingTags.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {seoResult.improvementSuggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gold">Improvements</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-gray-300">
                    {seoResult.improvementSuggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
