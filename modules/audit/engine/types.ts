/**
 * Issue with severity for audit engine.
 */
export type IssueSeverity = "critical" | "warning" | "improvement";

export interface Issue {
  severity: IssueSeverity;
  message: string;
}

/**
 * Shared result shape for each scoring module in the audit engine.
 */
export interface CategoryScoreResult {
  score: number;
  issues: Issue[];
  recommendations: string[];
}
