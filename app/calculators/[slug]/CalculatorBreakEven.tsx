"use client";

import { useState } from "react";

export function CalculatorBreakEven() {
  const [vasteKosten, setVasteKosten] = useState("");
  const [prijsPerEenheid, setPrijsPerEenheid] = useState("");
  const [variabeleKostenPerEenheid, setVariabeleKostenPerEenheid] = useState("");
  const contributie = prijsPerEenheid && variabeleKostenPerEenheid
    ? Number(prijsPerEenheid) - Number(variabeleKostenPerEenheid)
    : 0;
  const breakEven =
    vasteKosten && contributie > 0
      ? (Number(vasteKosten) / contributie).toFixed(0)
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="vaste" className="block text-sm font-medium text-marketing-text">
            Vaste kosten per periode (€)
          </label>
          <input
            id="vaste"
            type="number"
            min="0"
            step="0.01"
            value={vasteKosten}
            onChange={(e) => setVasteKosten(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="prijs" className="block text-sm font-medium text-marketing-text">
            Verkoopprijs per eenheid (€)
          </label>
          <input
            id="prijs"
            type="number"
            min="0"
            step="0.01"
            value={prijsPerEenheid}
            onChange={(e) => setPrijsPerEenheid(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="variabel" className="block text-sm font-medium text-marketing-text">
            Variabele kosten per eenheid (€)
          </label>
          <input
            id="variabel"
            type="number"
            min="0"
            step="0.01"
            value={variabeleKostenPerEenheid}
            onChange={(e) => setVariabeleKostenPerEenheid(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>
      {breakEven !== null && (
        <p className="mt-6 text-2xl font-semibold text-marketing-text">
          Break-even: <span className="text-gold">{breakEven}</span> eenheden
        </p>
      )}
    </div>
  );
}
