"use client";

import { useState } from "react";

export function CalculatorKorting() {
  const [originelePrijs, setOriginelePrijs] = useState("");
  const [kortingProcent, setKortingProcent] = useState("");
  const [kostprijs, setKostprijs] = useState("");
  const result =
    originelePrijs && kortingProcent && kostprijs
      ? {
          nieuwePrijs: (Number(originelePrijs) * (1 - Number(kortingProcent) / 100)).toFixed(2),
          margeOud: ((Number(originelePrijs) - Number(kostprijs)) / Number(originelePrijs) * 100).toFixed(1),
          margeNieuw: ((Number(originelePrijs) * (1 - Number(kortingProcent) / 100) - Number(kostprijs)) / (Number(originelePrijs) * (1 - Number(kortingProcent) / 100)) * 100).toFixed(1),
        }
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="prijs" className="block text-sm font-medium text-marketing-text">
            Originele prijs (€)
          </label>
          <input
            id="prijs"
            type="number"
            min="0"
            step="0.01"
            value={originelePrijs}
            onChange={(e) => setOriginelePrijs(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="korting" className="block text-sm font-medium text-marketing-text">
            Korting (%)
          </label>
          <input
            id="korting"
            type="number"
            min="0"
            max="100"
            step="1"
            value={kortingProcent}
            onChange={(e) => setKortingProcent(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="kost" className="block text-sm font-medium text-marketing-text">
            Kostprijs (€)
          </label>
          <input
            id="kost"
            type="number"
            min="0"
            step="0.01"
            value={kostprijs}
            onChange={(e) => setKostprijs(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>
      {result && (
        <div className="mt-6 space-y-2 text-lg text-marketing-text">
          <p>Prijs na korting: <span className="font-semibold text-gold">€{result.nieuwePrijs}</span></p>
          <p>Marge voor korting: {result.margeOud}%</p>
          <p>Marge na korting: {result.margeNieuw}%</p>
        </div>
      )}
    </div>
  );
}
