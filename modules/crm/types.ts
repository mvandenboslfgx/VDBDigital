export type LeadSource = "contact" | "audit" | "builder";

export type LeadInput = {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string;
  source: LeadSource;
};

export type LeadSummary = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  source: LeadSource;
  website?: string | null;
};

export type ClientProjectStatus = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  recentRequestCount: number;
};

export type ClientAnalyticsSummary = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
};

