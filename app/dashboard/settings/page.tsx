import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "@/lib/i18n";

export default async function DashboardSettingsPage() {
  const t = getTranslations("nl");
  const user = await requireUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { plan: true },
  });

  const planName = dbUser?.plan?.name ?? "free";
  const planPrice = dbUser?.plan?.price != null ? dbUser.plan.price / 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">{t("settings.title")}</h1>
        <p className="mt-1 text-gray-400">{t("settings.subtitle")}</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{t("settings.email")}</h2>
          <p className="mt-2 font-medium text-white">{user.email}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{t("settings.plan")}</h2>
          <p className="mt-2 font-medium text-white capitalize">{planName}</p>
          {planPrice > 0 && (
            <p className="mt-1 text-sm text-gray-400">€{planPrice}/maand</p>
          )}
          <Link
            href="/pricing"
            className="mt-3 inline-block text-sm font-medium text-gold hover:underline"
          >
            {t("settings.viewPlans")} →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{t("settings.portal")}</h2>
          <p className="mt-2 text-sm text-gray-400">
            {t("settings.portalDesc")}
          </p>
          <Link
            href="/portal/settings"
            className="mt-3 inline-block text-sm text-gold hover:underline"
          >
            {t("settings.openPortalSettings")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
