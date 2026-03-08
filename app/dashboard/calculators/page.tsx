import CalculatorsClient from "@/components/calculators/CalculatorsClient";
import { getTranslations } from "@/lib/i18n";

export default function DashboardCalculatorsPage() {
  const t = getTranslations("nl");
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">{t("calculators.title")}</h1>
        <p className="mt-1 text-gray-400">
          {t("calculators.subtitle")}
        </p>
      </div>
      <CalculatorsClient />
    </div>
  );
}
