"use client";

import { useState } from "react";

export function CalculatorPrijsverhoging() {
  const [huidigePrijs, setHuidigePrijs] = useState("");
  const [nieuwePrijs, setNieuwePrijs] = useState("");
  const [eenheden, setEenheden] = useState("");
  const verschil =
    huidigePrijs && nieuwePrijs && eenheden && Number(huidigePrijs) > 0
      ? {
          procent: (((Number(nieuwePrijs) - Number(huidigePrijs)) / Number(huidigePrijs)) * 100).toFixed(1),
          omzetOud: (Number(huidigePrijs) * Number(eenheden)).toFixed(2),
          omzetNieuw: (Number(nieuwePrijs) * Number(eenheden)).toFixed(2),
        }
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-8 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="huidige" className="block text-sm font-medium text-marketing-text">
            Huidige prijs (€)
          </label>
          <input
            id="huidige"
            type="number"
            min="0"
            step="0.01"
            value={huidigePrijs}
            onChange={(e) => setHuidigePrijs(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="nieuwe" className="block text-sm font-medium text-marketing-text">
            Nieuwe prijs (€)
          </label>
          <input
            id="nieuwe"
            type="number"
            min="0"
            step="0.01"
            value={nieuwePrijs}
            onChange={(e) => setNieuwePrijs(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="eenheden" className="block text-sm font-medium text-marketing-text">
            Verwachte verkoop (aantal)
          </label>
          <input
            id="eenheden"
            type="number"
            min="0"
            value={eenheden}
            onChange={(e) => setEenheden(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>
      {verschil && (
        <div className="mt-6 space-y-2 text-lg text-marketing-text">
          <p>Prijsverhoging: <span className="font-semibold text-gold">{verschil.procent}%</span></p>
          <p>Omzet voorheen: €{verschil.omzetOud}</p>
          <p>Omzet na verhoging: €{verschil.omzetNieuw}</p>
        </div>
      )}
    </div>
  );
}
