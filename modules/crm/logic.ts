import type { Lead, Project, ProjectRequest } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  LeadInput,
  LeadSummary,
  ClientProjectStatus,
  ClientAnalyticsSummary,
} from "./types";

export async function createLead(input: LeadInput): Promise<Lead> {
  const { name, email, company, message, website, source } = input;

  return prisma.lead.create({
    data: {
      name,
      email,
      company: company || null,
      message,
      website: website || null,
      source,
    },
  });
}

export async function getRecentLeads(limit = 20): Promise<LeadSummary[]> {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    createdAt: lead.createdAt,
    source: (lead.source as LeadSummary["source"]) ?? "contact",
    website: lead.website,
  }));
}

export function mapProjectsToStatuses(
  projects: (Project & {
    requests: ProjectRequest[];
  })[]
): ClientProjectStatus[] {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    createdAt: project.createdAt,
    recentRequestCount: project.requests.length,
  }));
}

export function computeClientAnalyticsSummary(
  projects: ClientProjectStatus[]
): ClientAnalyticsSummary {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status.toLowerCase() !== "completed"
  ).length;
  const completedProjects = projects.filter((p) =>
    p.status.toLowerCase().includes("completed")
  ).length;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
  };
}

