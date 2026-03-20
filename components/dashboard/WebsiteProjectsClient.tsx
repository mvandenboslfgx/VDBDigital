"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ScoreTrendChart } from "./ScoreTrendChart";
import { getScoreColorClass } from "@/lib/scoreColor";
import { approxSeoScoreDeltaFromLearning } from "@/lib/fix-learning";
import {
  applyResultV1Schema,
  type ApplyResultV1,
} from "@/modules/fixes/apply-result";

const LAST_GUIDED_ISSUE_KEY = "vdb:lastGuidedIssue";

function microProofUnderCta(issue: FixIssue): string | null {
  if (issue.type !== "seo" || !issue.learning) return null;
  const L = issue.learning;
  if (L.samples < 1) return null;
  const mid = approxSeoScoreDeltaFromLearning(L.successScore);
  const low = Math.max(0, mid - 5);
  const high = Math.min(25, mid + 5);
  const band =
    mid > 0
      ? `Meestal +${low}–${high} punten SEO-score (platformgemiddelde)`
      : "Gemiddeld subtiel effect op SEO-score (platformdata)";
  return `${band} · ${L.samples} vergelijkbare fixes · geen garantie`;
}

type AuditHistory = {
  id: string;
  website: string;
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
  createdAt: string;
  auditReportId: string | null;
};

type FixIssue = {
  id: string;
  type: string;
  title: string;
  description: string;
  fix: string;
  impact: string;
  learning?: {
    samples: number;
    approvalRate: number;
    successScore: number;
    confidence: number;
    finalScore: number;
    lowConfidence: boolean;
  };
};

type PageMetaSnapshot = {
  title: string;
  metaDescription: string;
  h1: string;
};

type MetaFixApplied = {
  type: "meta_update";
  page: string;
  before: { title?: string; description?: string; h1?: string };
  after: { title?: string; description?: string; h1?: string };
};

type LatestWebsiteAudit = {
  id: string;
  status: string;
  createdAt: string;
  errorMessage: string | null;
  scores: { seo: number; performance: number; ux: number; conversion: number } | null;
  issues: FixIssue[] | null;
  pageMeta: PageMetaSnapshot | null;
};

type Project = {
  id: string;
  domain: string;
  createdAt: string;
  auditHistories: AuditHistory[];
  latestWebsiteAudit: LatestWebsiteAudit | null;
};

function impactSeoHint(impact: string): string {
  if (impact === "high") {
    return "Verwachte impact: hoog — sterke invloed op vindbaarheid (SEO) en CTR in zoekresultaten.";
  }
  if (impact === "medium") {
    return "Verwachte impact: middel — merkbaar wanneer je dit samen met andere SEO-stappen doorvoert.";
  }
  return "Verwachte impact: gericht — nuttig als onderdeel van bredere optimalisatie.";
}

export function WebsiteProjectsClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLoadingId, setAuditLoadingId] = useState<string | null>(null);
  /** After client-side scan, overrides server snapshot for that project */
  const [liveAuditByProject, setLiveAuditByProject] = useState<
    Record<string, LatestWebsiteAudit | null>
  >({});
  const [metaFixPrepKey, setMetaFixPrepKey] = useState<string | null>(null);
  const [metaFixLoadingKey, setMetaFixLoadingKey] = useState<string | null>(null);
  const [metaFixPreview, setMetaFixPreview] = useState<Record<string, MetaFixApplied>>({});
  const [metaFixIds, setMetaFixIds] = useState<Record<string, string>>({});
  const [metaFixApproved, setMetaFixApproved] = useState<Record<string, boolean>>({});
  const [metaFixApproveLoading, setMetaFixApproveLoading] = useState<string | null>(null);
  /** Apply v1 (export): structured result per previewKey */
  const [metaFixApplyExported, setMetaFixApplyExported] = useState<Record<string, boolean>>({});
  const [metaFixApplyResult, setMetaFixApplyResult] = useState<
    Record<string, ApplyResultV1 | null>
  >({});
  const [metaFixApplyLoadingKey, setMetaFixApplyLoadingKey] = useState<string | null>(null);
  /** `${projectId}::${auditId}::${issueId}` — brief ring highlight after jump from best-actions */
  const [highlightedIssueKey, setHighlightedIssueKey] = useState<string | null>(null);
  /** Same key shape — set only when jumping from “Wat werkt het best” cards (CTA focus + copy) */
  const [guideCtaKey, setGuideCtaKey] = useState<string | null>(null);
  const fixesHydrated = useRef<Set<string>>(new Set());
  const guidedRestoreDone = useRef(false);

  useEffect(() => {
    if (!highlightedIssueKey) return;
    const t = window.setTimeout(() => setHighlightedIssueKey(null), 2600);
    return () => window.clearTimeout(t);
  }, [highlightedIssueKey]);

  useEffect(() => {
    if (!guideCtaKey) return;
    const t = window.setTimeout(() => setGuideCtaKey(null), 2600);
    return () => window.clearTimeout(t);
  }, [guideCtaKey]);

  useEffect(() => {
    if (!guideCtaKey) return;
    const t = window.setTimeout(() => {
      const [projectId, auditId, issueId] = guideCtaKey.split("::");
      if (!projectId || !auditId || !issueId) return;
      document.getElementById(`fix-cta-${projectId}-${auditId}-${issueId}`)?.focus();
    }, 450);
    return () => window.clearTimeout(t);
  }, [guideCtaKey]);

  function scrollToIssue(
    projectId: string,
    auditId: string,
    issueId: string,
    opts?: { focusGuideCta?: boolean; skipPersist?: boolean }
  ) {
    const el = document.getElementById(`issue-${projectId}-${auditId}-${issueId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const key = `${projectId}::${auditId}::${issueId}`;
    setHighlightedIssueKey(key);
    if (opts?.focusGuideCta) setGuideCtaKey(key);
    if (
      opts?.focusGuideCta &&
      !opts?.skipPersist &&
      typeof window !== "undefined"
    ) {
      try {
        localStorage.setItem(LAST_GUIDED_ISSUE_KEY, key);
      } catch {
        /* ignore quota / private mode */
      }
    }
  }

  useEffect(() => {
    if (guidedRestoreDone.current) return;
    if (typeof window === "undefined") return;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(LAST_GUIDED_ISSUE_KEY);
    } catch {
      guidedRestoreDone.current = true;
      return;
    }
    if (!raw) {
      guidedRestoreDone.current = true;
      return;
    }
    const parts = raw.split("::");
    if (parts.length !== 3) {
      try {
        localStorage.removeItem(LAST_GUIDED_ISSUE_KEY);
      } catch {
        /* ignore */
      }
      guidedRestoreDone.current = true;
      return;
    }
    const [projectId, auditId, issueId] = parts;
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      if (projects.length > 0) {
        try {
          localStorage.removeItem(LAST_GUIDED_ISSUE_KEY);
        } catch {
          /* ignore */
        }
        guidedRestoreDone.current = true;
      }
      return;
    }

    const audit = liveAuditByProject[projectId] ?? project.latestWebsiteAudit;
    if (!audit) return;
    if (audit.id !== auditId) {
      try {
        localStorage.removeItem(LAST_GUIDED_ISSUE_KEY);
      } catch {
        /* ignore */
      }
      guidedRestoreDone.current = true;
      return;
    }
    if (audit.status !== "completed") return;
    const hasIssue = audit.issues?.some((i) => i.id === issueId);
    if (!hasIssue) {
      try {
        localStorage.removeItem(LAST_GUIDED_ISSUE_KEY);
      } catch {
        /* ignore */
      }
      guidedRestoreDone.current = true;
      return;
    }

    const t = window.setTimeout(() => {
      const el = document.getElementById(`issue-${projectId}-${auditId}-${issueId}`);
      if (!el) {
        guidedRestoreDone.current = true;
        return;
      }
      const issue = audit.issues?.find((i) => i.id === issueId);
      const canMeta = issue?.type === "seo" && !!audit.pageMeta;
      scrollToIssue(projectId, auditId, issueId, {
        focusGuideCta: canMeta,
        skipPersist: true,
      });
      guidedRestoreDone.current = true;
    }, 450);
    return () => window.clearTimeout(t);
  }, [projects, liveAuditByProject]);

  function effortHintForBestAction(issue: FixIssue, cardIndex: number): string {
    if (cardIndex === 0 && issue.type === "seo") return "⏱️ ~2 min aanpassing";
    return "⚡ Snelle winst";
  }

  useEffect(() => {
    void (async () => {
      for (const p of projects) {
        const audit = liveAuditByProject[p.id] ?? p.latestWebsiteAudit;
        if (!audit?.id || audit.status !== "completed") continue;
        const marker = `${p.id}:${audit.id}`;
        if (fixesHydrated.current.has(marker)) continue;
        fixesHydrated.current.add(marker);
        try {
          const res = await fetch(
            `/api/dashboard/website-projects/${p.id}/fixes?auditId=${encodeURIComponent(audit.id)}`
          );
          if (!res.ok) {
            fixesHydrated.current.delete(marker);
            continue;
          }
          const data = (await res.json()) as {
            fixes?: Array<{
              id: string;
              sourceIssueId: string;
              kind: string;
              status: string;
              approved: boolean;
              applied?: boolean;
              applyResult?: unknown;
              payload?: { applied?: MetaFixApplied };
            }>;
          };
          const list = data.fixes;
          if (!Array.isArray(list)) continue;
          for (const f of list) {
            if (f.kind !== "meta_h1_v1" || f.status !== "preview_ready" || !f.payload?.applied) {
              continue;
            }
            const pk = `${audit.id}::${f.sourceIssueId}`;
            setMetaFixPreview((prev) => ({ ...prev, [pk]: f.payload!.applied! }));
            setMetaFixIds((prev) => ({ ...prev, [pk]: f.id }));
            if (f.approved) {
              setMetaFixApproved((prev) => ({ ...prev, [pk]: true }));
            }
            if (f.applied) {
              setMetaFixApplyExported((prev) => ({ ...prev, [pk]: true }));
              if (f.applyResult != null) {
                const parsed = applyResultV1Schema.safeParse(f.applyResult);
                if (parsed.success) {
                  setMetaFixApplyResult((prev) => ({ ...prev, [pk]: parsed.data }));
                }
              }
            }
          }
        } catch {
          fixesHydrated.current.delete(marker);
        }
      }
    })();
  }, [projects, liveAuditByProject]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const raw = domain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!raw) {
      setError("Vul een domein in (bijv. voorbeeld.nl).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: raw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kon website niet toevoegen.");
        return;
      }
      if (data.project) {
        setProjects((prev) => [
          {
            ...data.project,
            auditHistories: [],
            latestWebsiteAudit: null,
          },
          ...prev,
        ]);
        setDomain("");
      }
    } catch {
      setError("Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  };

  async function runStructuredAudit(projectId: string) {
    setError(null);
    setAuditLoadingId(projectId);
    try {
      const post = await fetch(`/api/dashboard/website-projects/${projectId}/audit`, {
        method: "POST",
      });
      const body = await post.json().catch(() => ({}));
      if (!post.ok) {
        setError(typeof body.error === "string" ? body.error : "Kon scan niet starten.");
        return;
      }
      const statusUrl = body.statusUrl as string;
      const websiteAuditId = body.websiteAuditId as string;
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const st = await fetch(statusUrl);
        const sj = await st.json().catch(() => ({}));
        if (sj.status === "failed") {
          setError(typeof sj.error === "string" ? sj.error : "Scan mislukt.");
          return;
        }
        if (sj.status === "completed") {
          const g = await fetch(`/api/dashboard/website-projects/${projectId}/audit`);
          const gj = await g.json().catch(() => ({}));
          const hit = Array.isArray(gj.audits)
            ? gj.audits.find((a: { id: string }) => a.id === websiteAuditId)
            : null;
          if (hit?.result?.scores) {
            setLiveAuditByProject((prev) => ({
              ...prev,
              [projectId]: {
                id: hit.id,
                status: hit.status,
                createdAt: hit.createdAt,
                errorMessage: hit.errorMessage ?? null,
                scores: hit.result.scores,
                issues: hit.result.issues ?? [],
                pageMeta: hit.result.pageMeta ?? null,
              },
            }));
          }
          setProjects((prev) =>
            prev.map((p) => {
              if (p.id !== projectId) return p;
              const histories = p.auditHistories;
              if (!hit?.result?.scores) return p;
              const now = new Date().toISOString();
              return {
                ...p,
                auditHistories: [
                  {
                    id: `local-${Date.now()}`,
                    website:
                      (hit.result as { signals?: { url?: string } }).signals?.url ??
                      `https://${p.domain}`,
                    seoScore: hit.result.scores.seo,
                    perfScore: hit.result.scores.performance,
                    uxScore: hit.result.scores.ux,
                    convScore: hit.result.scores.conversion,
                    createdAt: now,
                    auditReportId: null,
                  },
                  ...histories,
                ],
              };
            })
          );
          return;
        }
      }
      setError("Scan duurt langer dan verwacht. Vernieuw de pagina over een moment.");
    } catch {
      setError("Er ging iets mis bij de scan.");
    } finally {
      setAuditLoadingId(null);
    }
  }

  async function runMetaFix(projectId: string, websiteAuditId: string, issueId: string) {
    const previewKey = `${websiteAuditId}::${issueId}`;
    setError(null);
    setMetaFixPrepKey(previewKey);
    await new Promise((r) => setTimeout(r, 320));
    setMetaFixPrepKey(null);
    setMetaFixLoadingKey(previewKey);
    try {
      const post = await fetch(`/api/dashboard/website-projects/${projectId}/fixes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteAuditId, issueId }),
      });
      const body = await post.json().catch(() => ({}));
      if (!post.ok) {
        setError(typeof body.error === "string" ? body.error : "Kon fix niet starten.");
        return;
      }
      const statusUrl = body.statusUrl as string;
      const fixId = body.fixId as string;
      setMetaFixIds((prev) => ({ ...prev, [previewKey]: fixId }));
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const st = await fetch(statusUrl);
        const sj = await st.json().catch(() => ({}));
        if (sj.status === "failed") {
          setError(typeof sj.error === "string" ? sj.error : "Fix mislukt.");
          return;
        }
        if (sj.status === "completed") {
          const g = await fetch(`/api/dashboard/website-projects/${projectId}/fixes/${fixId}`);
          const gj = await g.json().catch(() => ({}));
          const applied = gj.fix?.payload?.applied as MetaFixApplied | undefined;
          if (applied?.type === "meta_update" && applied.after) {
            setMetaFixPreview((prev) => ({ ...prev, [previewKey]: applied }));
            setMetaFixApproved((prev) => {
              const next = { ...prev };
              delete next[previewKey];
              return next;
            });
          }
          return;
        }
      }
      setError("Fix duurt te lang. Vernieuw over een moment of probeer opnieuw.");
    } catch {
      setError("Er ging iets mis bij de fix.");
    } finally {
      setMetaFixPrepKey(null);
      setMetaFixLoadingKey(null);
    }
  }

  async function approveMetaFix(projectId: string, previewKey: string) {
    const fixId = metaFixIds[previewKey];
    if (!fixId) return;
    setMetaFixApproveLoading(previewKey);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/website-projects/${projectId}/fixes/${fixId}/approve`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Kon goedkeuring niet opslaan.");
        return;
      }
      setMetaFixApproved((prev) => ({ ...prev, [previewKey]: true }));
    } catch {
      setError("Er ging iets mis bij goedkeuren.");
    } finally {
      setMetaFixApproveLoading(null);
    }
  }

  async function runApplyExport(projectId: string, previewKey: string) {
    const fixId = metaFixIds[previewKey];
    if (!fixId) return;
    setMetaFixApplyLoadingKey(previewKey);
    setError(null);
    try {
      const res = await fetch(
        `/api/dashboard/website-projects/${projectId}/fixes/${fixId}/apply`,
        { method: "POST", credentials: "include" }
      );
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        applyResult?: unknown;
      };
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Kon export niet afronden.");
        return;
      }
      if (body.applyResult != null) {
        const parsed = applyResultV1Schema.safeParse(body.applyResult);
        setMetaFixApplyResult((prev) => ({
          ...prev,
          [previewKey]: parsed.success ? parsed.data : null,
        }));
      }
      setMetaFixApplyExported((prev) => ({ ...prev, [previewKey]: true }));
    } catch {
      setError("Er ging iets mis bij toepassen.");
    } finally {
      setMetaFixApplyLoadingKey(null);
    }
  }

  function downloadApplyJson(previewKey: string) {
    const r = metaFixApplyResult[previewKey];
    if (!r) return;
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vdb-fix-export-${previewKey.replace(/::/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyApplyJson(previewKey: string) {
    const r = metaFixApplyResult[previewKey];
    if (!r) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(r, null, 2));
    } catch {
      setError("Kopiëren mislukt.");
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="domain" className="text-label text-zinc-500">
            Website toevoegen
          </label>
          <Input
            id="domain"
            type="text"
            placeholder="voorbeeld.nl"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={loading}
            className="mt-2"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Toevoegen…" : "Toevoegen"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-6">
        {projects.map((project) => {
          const avgScores = project.auditHistories.map((h) =>
            Math.round((h.seoScore + h.perfScore + h.uxScore + h.convScore) / 4)
          );
          const latest = project.auditHistories[0];
          const fixAudit = liveAuditByProject[project.id] ?? project.latestWebsiteAudit;
          const scores = fixAudit?.scores;
          return (
            <div
              key={project.id}
              className="rounded-2xl border border-white/[0.06] bg-[#111113] p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {project.domain}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {project.auditHistories.length} scan(s)
                    {auditLoadingId === project.id || fixAudit?.status === "pending"
                      ? " · AI-scan wordt verwerkt…"
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={auditLoadingId === project.id}
                    onClick={() => runStructuredAudit(project.id)}
                  >
                    {auditLoadingId === project.id ? "Bezig…" : "AI audit + fixes"}
                  </Button>
                  <Link href={`/dashboard/audits?domain=${encodeURIComponent(project.domain)}`}>
                    <Button size="sm" variant="outline">
                      Snelle scan
                    </Button>
                  </Link>
                </div>
              </div>

              {scores && fixAudit?.status === "completed" && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ["SEO", scores.seo],
                      ["Performance", scores.performance],
                      ["UX", scores.ux],
                      ["Conversie", scores.conversion],
                    ] as const
                  ).map(([label, val]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        {label}
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${getScoreColorClass(val, "text")}`}>
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {fixAudit?.status === "failed" && fixAudit.errorMessage && (
                <p className="mt-4 text-sm text-red-400">{fixAudit.errorMessage}</p>
              )}

              {fixAudit?.status === "completed" && fixAudit.issues && fixAudit.issues.length > 0 && (
                <div className="mt-6 border-t border-white/[0.06] pt-6">
                  <h3 className="text-sm font-semibold text-white">Gestructureerde issues &amp; fixes</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    SEO-issues: genereer een veilige preview voor titel, meta description en H1. Niets wordt
                    live gezet zonder latere koppeling (CMS/webhook).
                  </p>
                  {(() => {
                    const withLearning = fixAudit.issues.filter((i) => i.learning);
                    const topTwo = withLearning.slice(0, 2);
                    const first = topTwo[0];
                    const showBest =
                      topTwo.length > 0 &&
                      first?.learning &&
                      first.learning.confidence > 0.4;
                    if (!showBest || !first?.learning) return null;
                    const proofSamples = Math.max(
                      ...topTwo.map((i) => i.learning?.samples ?? 0),
                      0
                    );
                    return (
                      <div className="mt-5 rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 via-black/20 to-transparent p-4">
                        <h4 className="text-sm font-semibold text-white">
                          Wat werkt het best voor jouw website
                        </h4>
                        <p className="mt-1 text-[11px] text-zinc-500">
                          Geprioriteerd op basis van goedkeuringen, gemiddelde SEO-trend en betrouwbaarheid
                          (geen causal bewijs).
                        </p>
                        {proofSamples > 0 && (
                          <p className="mt-2 text-[11px] text-zinc-400">
                            Gebaseerd op {proofSamples} vergelijkbare fixes op het platform
                          </p>
                        )}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {topTwo.map((issue, idx) => {
                            const L = issue.learning!;
                            const delta = approxSeoScoreDeltaFromLearning(L.successScore);
                            const seoLine =
                              delta > 0
                                ? `+${delta} punten SEO-score (gemiddeld)`
                                : delta < 0
                                  ? `${delta} punten SEO-score (gemiddeld)`
                                  : "≈ neutraal op SEO-score (gemiddeld)";
                            const icon = idx === 0 ? "🔥" : "📈";
                            return (
                              <button
                                key={issue.id}
                                type="button"
                                onClick={() =>
                                  scrollToIssue(project.id, fixAudit.id, issue.id, {
                                    focusGuideCta:
                                      issue.type === "seo" && !!fixAudit.pageMeta,
                                  })
                                }
                                className="w-full rounded-xl border border-white/10 bg-black/30 p-4 text-left transition hover:border-gold/40 hover:bg-black/40"
                              >
                                <p className="text-xs font-medium text-zinc-400">
                                  {icon}{" "}
                                  <span className="text-white">{issue.title}</span>
                                </p>
                                <p className="mt-2 text-sm font-semibold text-emerald-300">{seoLine}</p>
                                <p className="mt-1 text-xs text-zinc-400">
                                  {Math.round(L.approvalRate * 100)}% goedkeuring · Confidence:{" "}
                                  {Math.round(L.confidence * 100)}%
                                </p>
                                <p className="mt-2 text-[11px] text-zinc-500">
                                  {effortHintForBestAction(issue, idx)}
                                </p>
                                {idx === 0 && (
                                  <p className="mt-3 text-xs font-medium text-gold">
                                    → Start met deze fix (meeste impact)
                                  </p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  <ul className="mt-4 space-y-4">
                    {fixAudit.issues.map((issue) => {
                      const previewKey = `${fixAudit.id}::${issue.id}`;
                      const issueDomKey = `${project.id}::${fixAudit.id}::${issue.id}`;
                      const isHighlighted = highlightedIssueKey === issueDomKey;
                      const isGuideCta = guideCtaKey === issueDomKey;
                      const canMetaFix = issue.type === "seo" && !!fixAudit.pageMeta;
                      const preview = metaFixPreview[previewKey];
                      const rowCls = "text-zinc-300 text-sm";
                      return (
                        <li
                          id={`issue-${project.id}-${fixAudit.id}-${issue.id}`}
                          key={issue.id}
                          className={`scroll-mt-24 rounded-xl border bg-black/15 p-4 text-sm transition-shadow ${
                            isHighlighted
                              ? "border-gold/60 shadow-[0_0_0_1px_rgba(212,175,55,0.35)] ring-2 ring-gold/30"
                              : "border-white/[0.06]"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-white">{issue.title}</span>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                              {issue.type}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs ${
                                issue.impact === "high"
                                  ? "bg-red-500/20 text-red-300"
                                  : issue.impact === "medium"
                                    ? "bg-amber-500/20 text-amber-200"
                                    : "bg-zinc-500/20 text-zinc-400"
                              }`}
                            >
                              {issue.impact}
                            </span>
                          </div>
                          {issue.type === "seo" && (
                            <p className="mt-2 text-xs text-zinc-500">{impactSeoHint(issue.impact)}</p>
                          )}
                          {issue.learning && (
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              {issue.learning.samples >= 20 && (
                                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                                  Meest effectief ({issue.learning.samples} samples)
                                </span>
                              )}
                              {issue.learning.lowConfidence && (
                                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-amber-200">
                                  Nieuw type fix - nog weinig data
                                </span>
                              )}
                              <span className="rounded-md bg-white/10 px-2 py-0.5 text-zinc-300">
                                Confidence: {Math.round(issue.learning.confidence * 100)}%
                              </span>
                              <span className="rounded-md bg-white/10 px-2 py-0.5 text-zinc-400">
                                Approval: {Math.round(issue.learning.approvalRate * 100)}%
                              </span>
                            </div>
                          )}
                          <p className="mt-2 text-zinc-500">{issue.description}</p>
                          <p className="mt-2 text-zinc-300">
                            <span className="font-medium text-gold">Fix: </span>
                            {issue.fix}
                          </p>
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button
                              id={`fix-cta-${project.id}-${fixAudit.id}-${issue.id}`}
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                !canMetaFix ||
                                metaFixPrepKey === previewKey ||
                                metaFixLoadingKey === previewKey
                              }
                              className={
                                isGuideCta && canMetaFix
                                  ? "ring-2 ring-gold/50 ring-offset-2 ring-offset-[#111113]"
                                  : undefined
                              }
                              title={
                                canMetaFix
                                  ? "Genereer AI-preview (meta + H1)"
                                  : issue.type !== "seo"
                                    ? "Alleen voor SEO-issues (v1)"
                                    : "Eerst opnieuw AI-audit — dan staat pageMeta klaar"
                              }
                              onClick={() => runMetaFix(project.id, fixAudit.id, issue.id)}
                            >
                              {metaFixPrepKey === previewKey
                                ? "Fix wordt voorbereid…"
                                : metaFixLoadingKey === previewKey
                                  ? "Preview…"
                                  : isGuideCta && canMetaFix
                                    ? "Fix dit nu"
                                    : "Genereer meta + H1 preview"}
                            </Button>
                            {issue.type === "seo" && !fixAudit.pageMeta && (
                              <span className="text-xs text-zinc-500">
                                Voer opnieuw een AI-audit uit om meta-gegevens op te slaan.
                              </span>
                            )}
                          </div>
                          {preview && (
                            <div className="mt-4 space-y-3 rounded-xl border border-gold/20 bg-gold/5 p-4">
                              {!metaFixApproved[previewKey] && (
                                <p className="text-xs font-medium text-emerald-400/95">
                                  ✓ Klaar — bekijk het voorstel hieronder
                                </p>
                              )}
                              <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                                Preview (audit trail) — niet live
                              </p>
                              {(["title", "description", "h1"] as const).map((field) => {
                                const label =
                                  field === "title"
                                    ? "Titel"
                                    : field === "description"
                                      ? "Meta description"
                                      : "H1";
                                const beforeVal =
                                  field === "title"
                                    ? preview.before.title
                                    : field === "description"
                                      ? preview.before.description
                                      : preview.before.h1;
                                const afterVal =
                                  field === "title"
                                    ? preview.after.title
                                    : field === "description"
                                      ? preview.after.description
                                      : preview.after.h1;
                                if (!afterVal && !beforeVal) return null;
                                return (
                                  <div key={field} className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-500">{label}</p>
                                    {beforeVal ? (
                                      <p className={`${rowCls} line-through opacity-70`}>{beforeVal}</p>
                                    ) : (
                                      <p className={`${rowCls} italic text-zinc-500`}>(leeg in scan)</p>
                                    )}
                                    <p className={`${rowCls} font-medium text-white`}>{afterVal ?? "—"}</p>
                                  </div>
                                );
                              })}
                              <div className="border-t border-gold/20 pt-3 mt-3">
                                {metaFixApproved[previewKey] ? (
                                  <div className="space-y-3">
                                    <p className="text-xs font-medium text-emerald-400">
                                      Goedgekeurd en vastgelegd — jouw keuze staat in het datamodel.
                                    </p>
                                    {!metaFixApplyExported[previewKey] && (
                                      <>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="primary"
                                          disabled={
                                            !metaFixIds[previewKey] ||
                                            metaFixApplyLoadingKey === previewKey
                                          }
                                          onClick={() =>
                                            runApplyExport(project.id, previewKey)
                                          }
                                        >
                                          {metaFixApplyLoadingKey === previewKey
                                            ? "Bezig…"
                                            : "Toepassen op website"}
                                        </Button>
                                        <p className="text-xs text-zinc-500">
                                          Apply v1: veilige export (JSON) — plak zelf in je CMS of sitebuilder. Geen
                                          automatische live-mutatie in v1.
                                        </p>
                                      </>
                                    )}
                                    {metaFixApplyExported[previewKey] && (
                                      <div className="space-y-2">
                                        <p className="text-xs font-medium text-emerald-300">
                                          ✓ Export klaar — gebruik de waarden hierboven of download het JSON-pakket
                                          voor je team / Zapier.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={!metaFixApplyResult[previewKey]}
                                            onClick={() => downloadApplyJson(previewKey)}
                                          >
                                            Download JSON
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={!metaFixApplyResult[previewKey]}
                                            onClick={() => void copyApplyJson(previewKey)}
                                          >
                                            Kopieer JSON
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="primary"
                                      disabled={
                                        !metaFixIds[previewKey] ||
                                        metaFixApproveLoading === previewKey
                                      }
                                      onClick={() => approveMetaFix(project.id, previewKey)}
                                    >
                                      {metaFixApproveLoading === previewKey
                                        ? "Opslaan…"
                                        : "Goedkeuren & vastleggen"}
                                    </Button>
                                    <p className="mt-2 text-xs text-zinc-500">
                                      Eerst goedkeuren — daarna kun je de export (Apply v1) genereren. Nog geen
                                      wijziging op je live site zonder jouw CMS-stap.
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {project.auditHistories.length > 0 && (
                <>
                  <div className="mt-4">
                    <ScoreTrendChart scores={avgScores} labels={project.auditHistories.map((h) => new Date(h.createdAt).toLocaleDateString("nl-NL"))} />
                  </div>
                  {latest?.auditReportId && (
                    <Link
                      href={`/dashboard/reports/${latest.auditReportId}`}
                      className="mt-4 inline-block text-sm font-medium text-gold hover:underline"
                    >
                      Laatste rapport bekijken →
                    </Link>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-500">
          Voeg een website toe om te starten. Daarna kun je scans uitvoeren en de score-trend bekijken.
        </p>
      )}
    </div>
  );
}
