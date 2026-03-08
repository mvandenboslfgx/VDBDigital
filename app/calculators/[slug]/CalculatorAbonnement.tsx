"use client";

import { useState } from "react";

export function CalculatorAbonnement() {
  const [maandAbonnement, setMaandAbonnement] = useState("");
  const [eenmaligePrijs, setEenmaligePrijs] = useState("");
  const [maanden, setMaanden] = useState("12");
  const result =
    maandAbonnement && eenmaligePrijs && maanden
      ? {
          totaalAbonnement: (Number(maandAbonnement) * Number(maanden)).toFixed(2),
          vergelijk: Number(maandAbonnement) * Number(maanden) - Number(eenmaligePrijs),
        }
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="abonnement" className="block text-sm font-medium text-marketing-text">
            Maandbedrag abonnement (€)
          </label>
          <input
            id="abonnement"
            type="number"
            min="0"
            step="0.01"
            value={maandAbonnement}
            onChange={(e) => setMaandAbonnement(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="eenmalig" className="block text-sm font-medium text-marketing-text">
            Eenmalige prijs (€)
          </label>
          <input
            id="eenmalig"
            type="number"
            min="0"
            step="0.01"
            value={eenmaligePrijs}
            onChange={(e) => setEenmaligePrijs(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="maanden" className="block text-sm font-medium text-marketing-text">
            Aantal maanden
          </label>
          <input
            id="maanden"
            type="number"
            min="1"
            max="60"
            value={maanden}
            onChange={(e) => setMaanden(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>
      {result && (
        <div className="mt-6 space-y-2 text-lg text-marketing-text">
          <p>Totale omzet abonnement ({maanden} mnd): <span className="font-semibold text-gold">€{result.totaalAbonnement}</span></p>
          <p>
            {result.vergelijk > 0
              ? `Abonnement levert €${result.vergelijk.toFixed(2)} meer op dan eenmalig.`
              : `Eenmalig levert €${Math.abs(result.vergelijk).toFixed(2)} meer op dan abonnement over deze periode.`}
          </p>
        </div>
      )}
    </div>
  );
}
