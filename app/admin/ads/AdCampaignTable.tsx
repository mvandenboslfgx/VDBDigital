"use client";

type Campaign = {
  id: string;
  companyName: string;
  totalBudget: number;
  spent: number;
  cpc: number;
  active: boolean;
  partnerAds: { id: string }[];
};

export function AdCampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <p className="py-4 text-sm text-gray-500">
        Nog geen campagnes. Maak een campagne aan om advertenties aan te koppelen (optioneel).
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            <th className="pb-3 pr-4">Bedrijf</th>
            <th className="pb-3 pr-4">Budget (€)</th>
            <th className="pb-3 pr-4">Spent (€)</th>
            <th className="pb-3 pr-4">CPC (€)</th>
            <th className="pb-3 pr-4">Ads</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-b border-white/5">
              <td className="py-3 pr-4 font-medium text-white">{c.companyName}</td>
              <td className="py-3 pr-4 text-gray-300">{c.totalBudget.toFixed(2)}</td>
              <td className="py-3 pr-4 text-gray-300">{c.spent.toFixed(2)}</td>
              <td className="py-3 pr-4 text-gray-300">{c.cpc.toFixed(2)}</td>
              <td className="py-3 pr-4 text-gray-300">{c.partnerAds.length}</td>
              <td className="py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {c.active ? "Actief" : "Inactief"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
