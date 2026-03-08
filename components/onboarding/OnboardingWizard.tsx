"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

const STEPS = [
  { id: 1, title: "Business description" },
  { id: 2, title: "Website URL" },
  { id: 3, title: "AI audit preview" },
  { id: 4, title: "Dashboard setup" },
] as const;

export interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [businessDescription, setBusinessDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [auditPreview, setAuditPreview] = useState<{
    url: string;
    seoScore: number;
    perfScore: number;
    summary?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAuditPreview() {
    if (!websiteUrl.trim()) return;
    setError(null);
    setAuditLoading(true);
    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl.trim(), preview: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Audit failed");
      setAuditPreview({
        url: data.url || websiteUrl,
        seoScore: data.scores?.seoScore ?? 0,
        perfScore: data.scores?.perfScore ?? 0,
        summary: data.summaryShort || data.summary,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not run audit");
    } finally {
      setAuditLoading(false);
    }
  }

  async function completeOnboarding() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to complete");
      }
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canNext =
    (step === 1 && businessDescription.trim().length >= 10) ||
    (step === 2 && websiteUrl.trim().length > 0) ||
    step === 3 ||
    step === 4;

  return (
    <div className="rounded-2xl border border-gold/20 bg-black/60 p-6 shadow-xl md:p-8">
      <div className="mb-6 flex gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full ${
              step >= s.id ? "bg-gold/60" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <h2 className="text-lg font-semibold text-white">
        Step {step}: {STEPS[step - 1].title}
      </h2>

      {error && (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-400">
            Tell us briefly what your business does. This helps us personalize your experience.
          </p>
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="e.g. We build websites for small businesses in the Netherlands..."
            rows={4}
            className="input-base w-full"
          />
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-400">
            Enter your website URL. We&apos;ll run a quick audit in the next step.
          </p>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="input-base w-full max-w-md"
          />
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-400">
            Run a free AI audit preview on your website. No report is saved yet.
          </p>
          {!auditPreview ? (
            <>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="input-base w-full max-w-md"
              />
              <Button
                size="md"
                onClick={runAuditPreview}
                disabled={auditLoading || !websiteUrl.trim()}
              >
                {auditLoading ? "Analyzing…" : "Run audit preview"}
              </Button>
            </>
          ) : (
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
              <p className="text-sm text-gray-400">{auditPreview.url}</p>
              <div className="mt-2 flex gap-4">
                <span className="text-lg font-semibold text-white">
                  SEO: {auditPreview.seoScore}
                </span>
                <span className="text-lg font-semibold text-white">
                  Perf: {auditPreview.perfScore}
                </span>
              </div>
              {auditPreview.summary && (
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                  {auditPreview.summary}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-400">
            You&apos;re all set. Complete onboarding to access your dashboard.
          </p>
          <Button
            size="md"
            onClick={completeOnboarding}
            disabled={loading}
          >
            {loading ? "Saving…" : "Complete setup"}
          </Button>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        )}
        {step < 4 && (
          <Button
            size="md"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 3 && !auditPreview ? true : !canNext}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
