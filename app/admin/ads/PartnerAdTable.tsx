"use client";

import { useState } from "react";
import Image from "next/image";

type Ad = {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string | null;
  targetMetric: string;
  active: boolean;
  clicks: number;
  campaign: { id: string; companyName: string; totalBudget: number; spent: number; cpc: number; active: boolean } | null;
};

export function PartnerAdTable({ ads }: { ads: Ad[] }) {
  const [toggling, setToggling] = useState<string | null>(null);

  const toggleActive = async (ad: Ad) => {
    setToggling(ad.id);
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !ad.active }),
      });
      if (res.ok) window.location.reload();
    } finally {
      setToggling(null);
    }
  };

  const getActionLabel = (adId: string, isActive: boolean): string => {
    if (toggling === adId) return "…";
    return isActive ? "Deactiveren" : "Activeren";
  };

  if (ads.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Nog geen advertenties. Voeg er een toe via het formulier hieronder.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            <th className="pb-3 pr-4">Bedrijf / Titel</th>
            <th className="pb-3 pr-4">Metric</th>
            <th className="pb-3 pr-4">Klikken</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3">Actie</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad.id} className="border-b border-white/5">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {ad.image && (
                    <div className="group relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-white/10">
                      <Image
                        src={ad.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="64px"
                        unoptimized
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{ad.campaign?.companyName ?? ad.title}</p>
                    <p className="text-xs text-gray-500">{ad.title}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-gray-300">{ad.targetMetric}</td>
              <td className="py-3 pr-4 text-gray-300">{ad.clicks}</td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    ad.active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {ad.active ? "Actief" : "Inactief"}
                </span>
              </td>
              <td className="py-3">
                <button
                  onClick={() => toggleActive(ad)}
                  disabled={toggling === ad.id}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  {getActionLabel(ad.id, ad.active)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
