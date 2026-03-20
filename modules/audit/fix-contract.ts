import { z } from "zod";

/** Single actionable issue + fix — core product contract for dashboard / fix engine. */
export const auditFixIssueSchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(["seo", "ux", "performance", "conversion"]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2500),
  fix: z.string().min(1).max(4500),
  impact: z.enum(["low", "medium", "high"]),
});

export const auditFixPlanSchema = z.object({
  issues: z.array(auditFixIssueSchema).min(1).max(24),
});

export type AuditFixIssue = z.infer<typeof auditFixIssueSchema>;
export type AuditFixPlan = z.infer<typeof auditFixPlanSchema>;

/** Snapshot for Fix Engine v1 (meta + H1); optional on older audit rows. */
export type PageMetaSnapshot = {
  title: string;
  metaDescription: string;
  h1: string;
};

/** Persisted payload for a completed WebsiteAudit.result */
export type WebsiteAuditResultPayload = {
  scores: {
    seo: number;
    performance: number;
    ux: number;
    conversion: number;
  };
  issues: AuditFixIssue[];
  summary: string;
  summaryShort?: string;
  engineIssues: Array<{ severity: "critical" | "warning" | "improvement"; message: string }>;
  signals: { url: string; title: string };
  /** Present on new audits — required for meta/H1 fix preview. */
  pageMeta?: PageMetaSnapshot;
};
