export type AuditResult = {
  score: number;
  seoIssues: string[];
  uxIssues: string[];
  speedIssues: string[];
  recommendations: string[];
};

export type AuditRequestPayload = {
  url: string;
  email?: string;
};

