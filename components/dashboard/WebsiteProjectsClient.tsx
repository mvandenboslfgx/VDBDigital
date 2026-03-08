"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ScoreTrendChart } from "./ScoreTrendChart";

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

type Project = {
  id: string;
  domain: string;
  createdAt: string;
  auditHistories: AuditHistory[];
};

export function WebsiteProjectsClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          { ...data.project, auditHistories: [] },
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
                  </p>
                </div>
                <Link href={`/dashboard/audits?domain=${encodeURIComponent(project.domain)}`}>
                  <Button size="sm" variant="outline">
                    Scan starten
                  </Button>
                </Link>
              </div>
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
