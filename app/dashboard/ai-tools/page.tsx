import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canUseAiTools } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import AIToolsPanel from "@/components/dashboard/AIToolsPanel";
import { getTranslations } from "@/lib/i18n";

const tools = [
  { nameKey: "ai.websiteAudit", href: "/dashboard/audits", descriptionKey: "ai.websiteAuditDesc" },
  { nameKey: "ai.copy", href: "/ai-copy", descriptionKey: "ai.copyDesc" },
  { nameKey: "ai.siteBuilder", href: "/builder", descriptionKey: "ai.siteBuilderDesc" },
  { nameKey: "ai.competitorAnalyzer", href: "/competitor-analyzer", descriptionKey: "ai.competitorAnalyzerDesc" },
  { nameKey: "ai.funnelBuilder", href: "/funnel-builder", descriptionKey: "ai.funnelBuilderDesc" },
];

export default async function DashboardAIToolsPage() {
  const t = getTranslations("nl");
  const user = await requireUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { plan: true },
  });
  const allowed = dbUser ? canUseAiTools(dbUser) : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">{t("ai.tools")}</h1>
        <p className="mt-1 text-gray-400">
          {t("ai.toolsSubtitle")}
        </p>
      </div>

      {!allowed && (
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6">
          <h2 className="text-lg font-semibold text-gold">{t("ai.upgradeToUse")}</h2>
          <p className="mt-2 text-sm text-gray-400">
            {t("ai.upgradeDesc")}
          </p>
          <Link href="/pricing" className="mt-4 inline-block">
            <Button size="md">{t("ai.viewPlans")}</Button>
          </Link>
        </div>
      )}

      {allowed && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-white">{t("ai.quickTools")}</h2>
            <p className="mt-1 text-sm text-gray-400">{t("ai.quickToolsDesc")}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <AIToolsPanel />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">{t("ai.allTools")}</h2>
            <p className="mt-1 text-sm text-gray-400">{t("ai.allToolsDesc")}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-gold/30 hover:bg-white/10"
                >
                  <h3 className="font-semibold text-white">{t(tool.nameKey)}</h3>
                  <p className="mt-2 text-sm text-gray-400">{t(tool.descriptionKey)}</p>
                  <span className="mt-3 inline-block text-sm text-gold">{t("common.open")} →</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
