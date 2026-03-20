import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import DashboardWidget from "@/components/ui/DashboardWidget";
import { WebsiteProjectsClient } from "@/components/dashboard/WebsiteProjectsClient";

export default async function DashboardWebsitesPage() {
  const user = await requireUser();
  if (!user) return null;

  const rows = await prisma.websiteProject.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      auditHistories: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      websiteAudits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          createdAt: true,
          result: true,
          errorMessage: true,
        },
      },
    },
  });

  const projects = rows.map((p) => {
    const wa = p.websiteAudits[0];
    const r = wa?.result as
      | {
          scores?: { seo: number; performance: number; ux: number; conversion: number };
          issues?: Array<{
            id: string;
            type: string;
            title: string;
            description: string;
            fix: string;
            impact: string;
          }>;
          pageMeta?: { title: string; metaDescription: string; h1: string };
        }
      | null
      | undefined;
    return {
      id: p.id,
      domain: p.domain,
      createdAt: p.createdAt.toISOString(),
      auditHistories: p.auditHistories.map((h) => ({
        id: h.id,
        website: h.website,
        seoScore: h.seoScore,
        perfScore: h.perfScore,
        uxScore: h.uxScore,
        convScore: h.convScore,
        createdAt: h.createdAt.toISOString(),
        auditReportId: h.auditReportId,
      })),
      latestWebsiteAudit: wa
        ? {
            id: wa.id,
            status: wa.status,
            createdAt: wa.createdAt.toISOString(),
            errorMessage: wa.errorMessage,
            scores: r?.scores ?? null,
            issues: r?.issues ?? null,
            pageMeta: r?.pageMeta ?? null,
          }
        : null,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Mijn websites
        </h1>
        <p className="mt-2 text-zinc-500">
          Beheer je websites en bekijk scanhistorie en score-trend.
        </p>
      </div>

      <WebsiteProjectsClient initialProjects={projects} />

      <DashboardWidget
        title="Snelle scan"
        subtitle="Start een nieuwe website-audit"
        action={{ label: "Naar scans", href: "/dashboard/audits" }}
      >
        <Link href="/dashboard/audits">
          <Button size="md">Start scan</Button>
        </Link>
      </DashboardWidget>
    </div>
  );
}
