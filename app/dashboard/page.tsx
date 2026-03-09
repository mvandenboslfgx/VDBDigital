import Link from "next/link";
import dynamic from "next/dynamic";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardWidget from "@/components/ui/DashboardWidget";
import MetricCard from "@/components/ui/MetricCard";
import { Button } from "@/components/ui";
import { getUsage } from "@/lib/usage";
import { UsageDashboard } from "@/components/dashboard/UsageDashboard";
import { DashboardBentoGrid } from "@/components/dashboard/DashboardBentoGrid";
import { RecommendedStack } from "@/components/dashboard/RecommendedStack";
import { getRelevantAds } from "@/lib/ads";
import { getOrSet, dashboardCacheKey } from "@/lib/cache";
import { getTranslations } from "@/lib/i18n";

const DashboardOnboarding = dynamic(
  () => import("@/components/onboarding/DashboardOnboarding").then((m) => ({ default: m.default })),
  { ssr: true }
);

export default async function DashboardHomePage() {
  const t = getTranslations("nl");
  const user = await requireUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      onboardingCompleted: true,
      auditCountCurrentMonth: true,
      plan: { select: { name: true } },
    },
  });
  const showOnboarding = dbUser && !dbUser.onboardingCompleted;
  const auditCount = dbUser?.auditCountCurrentMonth ?? 0;
  const planName = dbUser?.plan?.name ?? "Gratis";

  const client = await prisma.client.findFirst({ where: { userId: user.id } });

  const [recentReports, usage, aiByTool, recentActivity] = await getOrSet(
    dashboardCacheKey(user.id),
    async () =>
      Promise.all([
    prisma.auditReport.findMany({
      where: { lead: { email: user.email } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        url: true,
        createdAt: true,
        seoScore: true,
        perfScore: true,
        uxScore: true,
        convScore: true,
      },
    }).then((reports) => reports.map((report) => ({ report }))),
    getUsage(user.id),
    prisma.aIUsage.groupBy({
      by: ["tool"],
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _count: { tool: true },
    }),
    prisma.usageEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, event: true, createdAt: true },
    }),
  ]),
    45_000
  );

  const totalScans = await prisma.auditReport.count({
    where: { lead: { email: user.email } },
  });

  const allCards = [
    {
      title: t("dashboard.websiteScans"),
      description: t("dashboard.websiteScansDesc"),
      href: "/dashboard/audits",
      cta: t("dashboard.startScan"),
      roles: ["lead", "pro", "customer"] as const,
    },
    {
      title: "AI Marketing Tools",
      description: "Website-audit, SEO keywords, conversion, copy, concurrent, performance, content.",
      href: "/tools",
      cta: "Open tools",
      roles: ["lead", "pro", "customer"] as const,
    },
    {
      title: t("dashboard.aiTools"),
      description: t("dashboard.aiToolsDesc"),
      href: "/dashboard/ai-tools",
      cta: t("dashboard.openAiTools"),
      roles: ["pro"] as const,
    },
    {
      title: t("dashboard.calculatorsTitle"),
      description: t("dashboard.calculatorsDesc"),
      href: "/dashboard/calculators",
      cta: t("dashboard.openCalculators"),
      roles: ["pro"] as const,
    },
    {
      title: t("dashboard.reports"),
      description: t("dashboard.reportsDesc"),
      href: "/dashboard/reports",
      cta: t("dashboard.viewReports"),
      roles: ["pro", "customer"] as const,
    },
    {
      title: t("dashboard.projectsTitle"),
      description: t("dashboard.projectsDesc"),
      href: "/dashboard/projects",
      cta: t("dashboard.viewProjects"),
      roles: ["customer"] as const,
    },
    {
      title: t("dashboard.settings"),
      description: t("dashboard.settingsDesc"),
      href: "/dashboard/settings",
      cta: t("dashboard.settings"),
      roles: ["lead", "pro", "customer"] as const,
    },
  ];
  const cards = allCards.filter((c) => (c.roles as readonly string[]).includes(user.role));

  const lastReport = recentReports[0]?.report;
  const lastScore = lastReport
    ? Math.round((lastReport.seoScore + lastReport.perfScore + lastReport.uxScore + lastReport.convScore) / 4)
    : null;

  const seoAvg =
    recentReports.length > 0
      ? Math.round(
          recentReports.reduce((s, r) => s + r.report.seoScore, 0) / recentReports.length
        )
      : null;

  const bentoStats = [
    { label: "Totaal scans", value: totalScans, subtext: "Alle rapporten" },
    { label: "Jouw plan", value: planName, subtext: "Huidig abonnement" },
    {
      label: "SEO-gemiddelde",
      value: seoAvg != null ? `${seoAvg}/100` : "—",
      subtext: "Van laatste scans",
    },
  ];

  const quickActions: Array<{ label: string; href: string; icon?: string }> = [
    { label: t("dashboard.startScan"), href: "/dashboard/audits", icon: "▶" },
    { label: "Exporteer rapport", href: recentReports[0] ? `/dashboard/reports/${recentReports[0].report.id}` : "/dashboard/reports", icon: "↓" },
    { label: t("dashboard.settings"), href: "/dashboard/settings", icon: "⚙" },
  ];

  const metricLabels: Record<string, string> = {
    SEO: "SEO",
    PERF: "snelheid",
    UX: "gebruiksvriendelijkheid",
    CONV: "conversie",
  };
  const relevantAds =
    lastReport != null
      ? await getRelevantAds(
          {
            seoScore: lastReport.seoScore,
            perfScore: lastReport.perfScore,
            uxScore: lastReport.uxScore,
            convScore: lastReport.convScore,
          },
          3
        )
      : [];
  const lowestMetricLabel =
    relevantAds.length > 0
      ? metricLabels[relevantAds[0].targetMetric] ?? relevantAds[0].targetMetric
      : "";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-saas-card md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Welkom terug
        </h1>
        <p className="mt-2 text-slate-600">
          {user.role === "lead"
            ? t("dashboard.leadIntro")
            : user.role === "customer"
              ? t("dashboard.customerIntro")
              : t("dashboard.proIntro")}
        </p>
        <div className="mt-6">
          <DashboardBentoGrid
            stats={bentoStats}
            recentActivity={recentActivity}
            quickActions={quickActions}
            recentReports={recentReports}
            lastScore={lastScore}
            userRole={user.role}
            t={t}
          />
        </div>
      </div>

      {relevantAds.length > 0 && (
        <RecommendedStack ads={relevantAds} lowestMetricLabel={lowestMetricLabel} />
      )}

      {showOnboarding && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t("dashboard.welcomeSetup")}</h2>
          <DashboardOnboarding />
        </section>
      )}

      {user.role === "lead" && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.upgradeCta")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("dashboard.upgradeDesc")}
          </p>
          <Link href="/prijzen" className="mt-4 inline-block">
            <Button size="md" className="min-h-[44px]">{t("dashboard.viewPlans")}</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recentReports.length > 0 ? (
          <>
            <MetricCard
              label={t("dashboard.websiteScore")}
              value={String(Math.round((recentReports[0].report.seoScore + recentReports[0].report.perfScore + recentReports[0].report.uxScore + recentReports[0].report.convScore) / 4))}
              subtext={t("dashboard.fromLastScan")}
            />
            <MetricCard label={t("dashboard.seoScore")} value={String(recentReports[0].report.seoScore)} subtext={t("dashboard.fromLastScan")} />
            <MetricCard label={t("dashboard.performance")} value={String(recentReports[0].report.perfScore)} subtext={t("dashboard.fromLastScan")} />
            <MetricCard label={t("dashboard.conversion")} value={String(recentReports[0].report.convScore)} subtext={t("dashboard.fromLastScan")} />
          </>
        ) : (
          <>
            <MetricCard label={t("dashboard.websiteScore")} value="—" subtext={t("dashboard.startScanToSee")} />
            <MetricCard label={t("dashboard.seoScore")} value="—" subtext={t("dashboard.fromLastScan")} />
            <MetricCard label={t("dashboard.performance")} value="—" subtext={t("dashboard.fromLastScan")} />
            <MetricCard label={t("dashboard.conversion")} value="—" subtext={t("dashboard.fromLastScan")} />
          </>
        )}
      </div>

      <UsageDashboard />

      <DashboardWidget
        title={t("dashboard.usageThisMonth")}
        subtitle={t("dashboard.usageSubtitle")}
        action={{ label: t("dashboard.billing"), href: "/dashboard/billing" }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">{t("dashboard.aiUsage")}</p>
            <p className="text-xl font-semibold text-slate-900">{usage.aiUsage}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t("dashboard.calculators")}</p>
            <p className="text-xl font-semibold text-slate-900">{usage.calculatorUsage}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t("dashboard.projects")}</p>
            <p className="text-xl font-semibold text-slate-900">{usage.projectCount}</p>
          </div>
        </div>
        {aiByTool.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-slate-500">{t("dashboard.aiByTool")}</p>
            <ul className="mt-1 space-y-1 text-sm text-slate-600">
              {aiByTool.map((row) => (
                <li key={row.tool}>
                  {row.tool}: {row._count.tool}
                </li>
              ))}
            </ul>
          </div>
        )}
      </DashboardWidget>

      <DashboardWidget title={t("dashboard.recentActivity")} subtitle={t("dashboard.recentActivitySubtitle")}>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500">{t("dashboard.noRecentActivity")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentActivity.map((ev) => (
              <li key={ev.id} className="flex justify-between text-slate-600">
                <span>{ev.event}</span>
                <span className="text-slate-500">
                  {new Date(ev.createdAt).toLocaleDateString("nl-NL")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardWidget>

      {recentReports.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-surface p-8 text-center shadow-saas-card md:p-12">
          <p className="text-lg font-medium text-slate-900">{t("dashboard.noWebsiteAnalyzed")}</p>
          <p className="mt-2 text-sm text-slate-600">
            {t("dashboard.startFirstScan")}
          </p>
          <Link href="/dashboard/audits" className="mt-6 inline-block">
            <Button size="lg">{t("dashboard.startWebsiteScan")}</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardWidget
          title="Laatste audits"
          subtitle={t("dashboard.recentScansSubtitle")}
          action={recentReports.length > 0 ? { label: t("dashboard.viewAll"), href: "/dashboard/reports" } : undefined}
        >
          {recentReports.length > 0 ? (
            <ul className="space-y-3">
              {recentReports.slice(0, 5).map(({ report }) => (
                <li key={report.id}>
                  <Link
                    href={`/dashboard/reports/${report.id}`}
                    className="block rounded-lg py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span className="font-medium text-slate-900">
                      {report.url.replace(/^https?:\/\//, "").slice(0, 40)}
                    </span>
                    <span className="ml-2 text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString("nl-NL")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">{t("dashboard.noScansYet")}</p>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Upgrade advies"
          subtitle={t("dashboard.aiAdviceSubtitle")}
          action={recentReports.length > 0 ? { label: t("dashboard.viewReport"), href: `/dashboard/reports/${recentReports[0]?.report.id}` } : undefined}
        >
          {recentReports.length > 0 ? (
            <p className="text-sm text-slate-600">
              {t("dashboard.openReportForAdvice")}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{t("dashboard.runScanForAdvice")}</p>
          )}
        </DashboardWidget>

        <DashboardWidget
          title={t("dashboard.growthOpportunities")}
          subtitle={t("dashboard.growthSubtitle")}
        >
          <p className="text-sm text-slate-500">
            {t("dashboard.growthPlaceholder")}
          </p>
        </DashboardWidget>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-gray-200 bg-surface p-6 shadow-saas-card transition-all duration-300 hover:scale-[1.02] hover:shadow-saas-card-hover"
          >
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-indigo-600">
              {card.cta} →
            </span>
          </Link>
        ))}
      </div>

      {client && (
        <DashboardWidget
          title={t("dashboard.clientPortal")}
          subtitle={t("dashboard.clientPortalSubtitle")}
          action={{ label: t("dashboard.openPortal"), href: "/portal" }}
        >
          <p className="text-sm text-slate-600">
            {t("dashboard.portalAccess")}
          </p>
        </DashboardWidget>
      )}
    </div>
  );
}
