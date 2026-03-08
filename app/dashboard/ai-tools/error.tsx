"use client";

import Link from "next/link";
import ErrorFallback from "@/components/ui/ErrorFallback";
import { useTranslations } from "@/components/I18nProvider";

export default function AIToolsError({
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
        title={t("errors.aiToolsTitle")}
        message={t("errors.aiToolsMessage")}
        onRetry={reset}
      />
      <p className="text-center text-sm text-zinc-500">
        <Link href="/dashboard/ai-tools" className="text-gold hover:underline">
          {t("errors.reopenAiTools")}
        </Link>
        {" · "}
        <Link href="/dashboard" className="text-gold hover:underline">
          {t("errors.toDashboard")}
        </Link>
      </p>
    </div>
  );
}
