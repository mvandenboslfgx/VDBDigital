import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { getAllPartnerAds, getAllAdCampaigns } from "@/lib/ads";
import { PartnerAdTable } from "./PartnerAdTable";
import { PartnerAdForm } from "./PartnerAdForm";
import { AdCampaignTable } from "./AdCampaignTable";
import { AdCampaignForm } from "./AdCampaignForm";
import { AdminAdsStats } from "./AdminAdsStats";

export default async function AdminAdsPage() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) redirect("/dashboard");

  const [ads, campaigns] = await Promise.all([getAllPartnerAds(), getAllAdCampaigns()]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
        <h1 className="text-xl font-semibold text-white">Advertentiebeheer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Beheer campagnes en partner-advertenties voor in auditrapporten (op basis van laagste score).
        </p>

        <AdminAdsStats campaigns={campaigns} ads={ads} />

        <h2 className="mt-8 text-lg font-semibold text-white">Campagnes</h2>
        <p className="mt-1 text-sm text-gray-400">
          Campagnes bepalen budget en CPC; koppel ze optioneel aan een advertentie.
        </p>
        <AdCampaignTable campaigns={campaigns} />
        <AdCampaignForm />

        <h2 className="mt-10 text-lg font-semibold text-white">Partner-advertenties</h2>
        <div className="mt-4">
          <PartnerAdTable ads={ads} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Nieuwe advertentie toevoegen</h2>
        <p className="mt-1 text-sm text-gray-400">
          Vul de velden in. Kies optioneel een campagne voor CPC-facturatie. Metric (SEO, Perf, UX, Conv) bepaalt wanneer de ad getoond wordt.
        </p>
        <PartnerAdForm campaigns={campaigns} />
      </div>
    </div>
  );
}
