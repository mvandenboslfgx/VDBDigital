"use client";

type Campaign = { id: string; companyName: string; spent: number };
type Ad = { id: string; title: string; clicks: number; campaign?: { companyName: string } | null };

interface AdminAdsStatsProps {
  campaigns: Campaign[];
  ads: Ad[];
}

export function AdminAdsStats({ campaigns, ads }: AdminAdsStatsProps) {
  const totalEarned = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);
  const avgClicksPerAd = ads.length > 0 ? totalClicks / ads.length : 0;

  const topByClicks = [...ads]
    .filter((a) => a.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);
  const maxClicks = Math.max(1, ...topByClicks.map((a) => a.clicks));

  return (
    <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-gray-400">Totaal verdiend</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          € {totalEarned.toFixed(2)}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">Som van spent (alle campagnes)</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-gray-400">Totaal klikken</p>
        <p className="mt-1 text-2xl font-semibold text-white">{totalClicks}</p>
        <p className="mt-0.5 text-xs text-gray-500">Alle advertenties</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-gray-400">Gem. klikken per ad</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          {avgClicksPerAd.toFixed(1)}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">CTR-indicator (geen impressies)</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-gray-400">Actieve ads</p>
        <p className="mt-1 text-2xl font-semibold text-white">{ads.length}</p>
        <p className="mt-0.5 text-xs text-gray-500">Partner-advertenties</p>
      </div>

      <div className="sm:col-span-2 lg:col-span-4">
        <h3 className="mb-4 text-sm font-semibold text-white">Best presterende partners (op klikken)</h3>
        {topByClicks.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-500">
            Nog geen klikken. Klikken worden geteld zodra gebruikers op een advertentie klikken.
          </p>
        ) : (
          <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
            {topByClicks.map((ad) => (
              <div key={ad.id} className="flex items-center gap-3">
                <div className="min-w-[120px] shrink-0 text-sm text-gray-300">
                  {ad.campaign?.companyName ?? ad.title}
                </div>
                <div className="flex-1">
                  <div
                    className="h-6 rounded bg-indigo-500/80 transition-all"
                    style={{ width: `${Math.max(4, (ad.clicks / maxClicks) * 100)}%` }}
                    title={`${ad.clicks} klikken`}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-medium text-white">
                  {ad.clicks}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
