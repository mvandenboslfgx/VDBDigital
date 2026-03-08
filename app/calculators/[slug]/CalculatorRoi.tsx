"use client";

import { useState } from "react";

export function CalculatorRoi() {
  const [investering, setInvestering] = useState("");
  const [opbrengst, setOpbrengst] = useState("");
  const roi =
    investering && opbrengst && Number(investering) > 0
      ? (((Number(opbrengst) - Number(investering)) / Number(investering)) * 100).toFixed(1)
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="investering" className="block text-sm font-medium text-marketing-text">
            Investering (€)
          </label>
          <input
            id="investering"
            type="number"
            min="0"
            step="0.01"
            value={investering}
            onChange={(e) => setInvestering(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="opbrengst" className="block text-sm font-medium text-marketing-text">
            Opbrengst (€)
          </label>
          <input
            id="opbrengst"
            type="number"
            min="0"
            step="0.01"
            value={opbrengst}
            onChange={(e) => setOpbrengst(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>
      {roi !== null && (
        <p className="mt-6 text-2xl font-semibold text-marketing-text">
          ROI: <span className="text-gold">{roi}%</span>
        </p>
      )}
    </div>
  );
}
