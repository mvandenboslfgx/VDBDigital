"use client";

import { Button } from "@/components/ui";
import { useTranslations } from "@/components/I18nProvider";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorFallback({
  title,
  message,
  onRetry,
}: ErrorFallbackProps) {
  const { t } = useTranslations();
  const displayTitle = title ?? t("errors.genericTitle");
  const displayMessage = message ?? t("errors.genericMessage");
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
      <h2 className="text-lg font-semibold text-white">{displayTitle}</h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{displayMessage}</p>
      {onRetry && (
        <Button className="mt-6" size="md" onClick={onRetry}>
          {t("errors.retry")}
        </Button>
      )}
    </div>
  );
}
