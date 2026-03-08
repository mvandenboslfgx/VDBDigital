"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import UpgradeModal from "@/components/UpgradeModal";
import { Button, Input, Panel } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";

type Scores = {
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
};

type AuditState =
  | { step: "form" }
  | { step: "loading"; url: string; progress: number }
  | { step: "preview"; url: string; scores: Scores; summaryShort: string }
  | { step: "full"; url: string; scores: Scores; summary: string };

const SCAN_STEPS = [
  { id: "seo", label: "SEO controleren…" },
  { id: "perf", label: "Performance analyseren…" },
  { id: "ux", label: "UX controleren…" },
  { id: "conv", label: "Conversie analyseren…" },
];

function averageScore(s: Scores) {
  return Math.round((s.seoScore + s.perfScore + s.uxScore + s.convScore) / 4);
}

export default function AuditToolClient({ initialEmail = "" }: { initialEmail?: string }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [company, setCompany] = useState("");
  const [state, setState] = useState<AuditState>({ step: "form" });
  const [error, setError] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string>("");

  const trackEvent = (type: string) => {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const raw = url.trim();
    if (!raw) {
      setError("Vul een website-URL in.");
      return;
    }
    setState({ step: "loading", url: raw, progress: 0 });
    trackEvent("audit_started");

    const steps = [0, 25, 50, 75];
    steps.forEach((p, i) => {
      setTimeout(() => {
        setState((s) => (s.step === "loading" ? { ...s, progress: p } : s));
      }, 600 + i * 800);
    });

    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw, preview: true }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        scores?: Scores;
        summaryShort?: string;
        summary?: string;
        url?: string;
      };
      if (!res.ok || !data.success) {
        if (res.status === 429 || (data.message && /limit|upgrade/i.test(data.message))) {
          setUpgradeMessage(data.message || "Je hebt je maandelijkse auditlimiet bereikt. Upgrade voor meer.");
          setUpgradeModalOpen(true);
        } else {
          setError(data.message || "Analyse mislukt. Probeer het opnieuw.");
        }
        setState({ step: "form" });
        return;
      }
      setState({
        step: "preview",
        url: data.url || raw,
        scores: data.scores!,
        summaryShort: data.summaryShort || data.summary || "",
      });
      trackEvent("audit_completed");
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      setState({ step: "form" });
    }
  };

  const handleUnlockFull = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("E-mail is verplicht om het volledige rapport te ontgrendelen.");
      return;
    }
    setState((s) => (s.step === "preview" ? { step: "loading" as const, url: s.url, progress: 0 } : s));
    try {
      const res = await fetch("/api/ai/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: state.step === "preview" ? state.url : url,
          email: email.trim(),
          name: name.trim() || undefined,
          company: company.trim() || undefined,
          preview: false,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        scores?: Scores;
        summary?: string;
        url?: string;
      };
      if (!res.ok || !data.success) {
        if (res.status === 429 || (data.message && /limit|upgrade/i.test(data.message))) {
          setUpgradeMessage(data.message || "Je hebt je maandelijkse auditlimiet bereikt. Upgrade voor meer.");
          setUpgradeModalOpen(true);
        } else {
          setError(data.message || "Volledig rapport kon niet worden gegenereerd.");
        }
        setState((s) => (s.step === "preview" ? s : { step: "form" }));
        return;
      }
      setState({
        step: "full",
        url: data.url || url,
        scores: data.scores!,
        summary: data.summary || "",
      });
      trackEvent("lead_created");
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      if (state.step === "preview") setState(state);
      else setState({ step: "form" });
    }
  };

  return (
    <div className="space-y-8">
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        message={upgradeMessage}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Website-scans
        </h1>
        <p className="mt-2 text-zinc-500">
          Voer AI-scans uit. Krijg scores voor SEO, performance, UX en conversie plus een volledig rapport.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state.step === "form" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleAnalyze}
            className="max-w-xl space-y-6 rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-panel"
          >
            <Input
              label="Website-URL *"
              type="url"
              placeholder="https://jouwsite.nl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Start website scan
            </Button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </motion.form>
        )}

        {state.step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-panel"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-zinc-300">
                Analyseren van {state.url.replace(/^https?:\/\//, "").slice(0, 36)}…
              </span>
            </div>
            <div className="space-y-4">
              {SCAN_STEPS.map((step, i) => {
                const progress = state.progress;
                const done = (i + 1) * 25 <= progress;
                const active = progress >= i * 25 && progress < (i + 1) * 25;
                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className="h-2 flex-1 max-w-sm rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold"
                        initial={{ width: 0 }}
                        animate={{ width: done ? "100%" : active ? "60%" : "0%" }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span
                      className={`min-w-[200px] text-sm font-medium ${
                        done ? "text-white" : active ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {(state.step === "preview" || state.step === "full") && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-panel">
              <div className="mb-8 text-center">
                <p className="text-label text-zinc-500">Website score</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {averageScore(state.scores)} <span className="text-2xl text-zinc-500 md:text-3xl">/ 100</span>
                </p>
                <p className="mt-2 text-sm text-zinc-500">Gemiddelde prestatie</p>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-8 sm:justify-between">
                <ScoreRing score={state.scores.seoScore} label="SEO" size="md" />
                <ScoreRing score={state.scores.perfScore} label="Performance" size="md" />
                <ScoreRing score={state.scores.uxScore} label="UX" size="md" />
                <ScoreRing score={state.scores.convScore} label="Conversie" size="md" />
              </div>
            </div>

            <Panel title={state.step === "full" ? "Volledig scanrapport" : "Preview"}>
              <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed">
                {state.step === "full" ? state.summary : state.summaryShort}
              </div>
              {state.step === "preview" && (
                <p className="mt-4 text-sm text-gold">
                  Vul hieronder je e-mail in om het volledige rapport te ontgrendelen.
                </p>
              )}
            </Panel>

            {state.step === "preview" && (
              <form
                onSubmit={handleUnlockFull}
                className="max-w-xl space-y-6 rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-panel"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Naam"
                    placeholder="Je naam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Bedrijf"
                    placeholder="Bedrijfsnaam"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <Input
                  label="E-mail *"
                  type="email"
                  placeholder="je@bedrijf.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Volledig rapport ontgrendelen
                </Button>
                {error && <p className="text-sm text-red-400">{error}</p>}
              </form>
            )}

            {state.step === "full" && (
              <p className="text-sm text-zinc-500">
                <Link href="/dashboard/reports" className="text-gold hover:underline">
                  Alle rapporten bekijken
                </Link>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
