import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanConfigByPlanName } from "@/lib/plans";
import { getUsage, checkUsageLimit } from "@/lib/usage";
import { getAndEnsureCurrentMonthCount } from "@/lib/audit-limits";
import { Button } from "@/components/ui";
import BillingPortalButton from "./BillingPortalButton";
import UpgradeCheckoutButton from "./UpgradeCheckoutButton";
import { getTranslations } from "@/lib/i18n";

export const metadata = {
  title: "Facturatie | VDB Digital",
  description: "Beheer je abonnement, gebruik en facturatie.",
};

export default async function DashboardBillingPage() {
  const t = getTranslations("nl");
  const user = await requireUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { plan: true },
  });

  const planName = dbUser?.plan?.name ?? "free";
  const planConfig = getPlanConfigByPlanName(planName);
  const [limitCheck, auditCount] = await Promise.all([
    checkUsageLimit(user.id),
    getAndEnsureCurrentMonthCount(user.id),
  ]);
  const usage = limitCheck.usage;
  const auditLimit = planConfig.scansPerMonth;
  const auditLimitReached = typeof auditLimit === "number" && auditLimit !== Infinity && auditCount >= auditLimit;

  const formatLimit = (n: number) =>
    n === Infinity ? t("billing.unlimited") : n.toLocaleString();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t("billing.title")}</h1>
        <p className="mt-1 text-slate-600">
          {t("billing.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-saas-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {t("billing.currentPlan")}
          </h2>
          <p className="mt-2 text-xl font-medium text-slate-900">
            {planConfig.name}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {planConfig.monthlyPrice === 0
              ? t("billing.free")
              : `€${planConfig.monthlyPrice}/maand`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {planConfig.features.aiTools && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                {t("dashboard.aiTools")}
              </span>
            )}
            {planConfig.features.calculators && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                {t("dashboard.calculatorsTitle")}
              </span>
            )}
            {planConfig.features.audits && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                {t("billing.audits")}
              </span>
            )}
            {planConfig.features.crm && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                CRM
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-saas-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {t("billing.usageThisMonth")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-600">Website scans</span>
              <span className="font-medium text-slate-900">
                {auditCount} / {formatLimit(auditLimit)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-600">{t("dashboard.aiTools")}</span>
              <span className="font-medium text-slate-900">
                {usage.aiUsage} / {formatLimit(planConfig.aiLimit)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-600">{t("dashboard.calculatorsTitle")}</span>
              <span className="font-medium text-slate-900">
                {usage.calculatorUsage} / {formatLimit(planConfig.calculatorLimit)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-600">{t("dashboard.projects")}</span>
              <span className="font-medium text-slate-900">
                {usage.projectCount} / {formatLimit(planConfig.projects)}
              </span>
            </li>
          </ul>
          {(limitCheck.exceeded || auditLimitReached) && (
            <p className="mt-3 text-xs text-amber-600">
              {auditLimitReached && !limitCheck.exceeded
                ? "Uw maandelijkse scanlimiet is bereikt. Upgrade voor meer scans."
                : t("billing.limitReached").replace(
                    "{type}",
                    limitCheck.exceeded === "ai"
                      ? t("dashboard.aiTools")
                      : limitCheck.exceeded === "calculator"
                        ? t("dashboard.calculatorsTitle")
                        : t("dashboard.projects")
                  )}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-saas-card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("billing.manageSubscription")}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {t("billing.manageSubscriptionDesc")} Bekijk en download uw facturen in het facturatieportaal.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <UpgradeCheckoutButton />
          {dbUser?.stripeCustomerId ? (
            <BillingPortalButton />
          ) : (
            <Link href="/prijzen">
              <Button size="md">{t("billing.choosePlan")}</Button>
            </Link>
          )}
          <Link href="/prijzen">
            <Button variant="secondary" size="md">
              {planName === "free" || planName === "starter"
                ? t("billing.upgrade")
                : t("billing.changePlan")}
            </Button>
          </Link>
        </div>
      </div>

      {(planName === "free" || !planName) && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-700">
            {t("billing.upgradeTitle")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("billing.upgradeDesc")}
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/prijzen">
              <Button size="md">{t("dashboard.viewPlans")}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
