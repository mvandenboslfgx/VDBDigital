"use client";

import Link from "next/link";
import ErrorFallback from "@/components/ui/ErrorFallback";
import { useTranslations } from "@/components/I18nProvider";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslations();
  return (
    <div className="space-y-6">
      <ErrorFallback
        title={t("errors.dashboardTitle")}
        message={t("errors.dashboardMessage")}
        onRetry={reset}
      />
      <p className="text-center text-sm text-zinc-500">
        <Link href="/dashboard" className="text-gold hover:underline">
          {t("errors.toDashboard")}
        </Link>
        {" · "}
        <Link href="/" className="text-gold hover:underline">
          {t("errors.toHome")}
        </Link>
      </p>
    </div>
  );
}
