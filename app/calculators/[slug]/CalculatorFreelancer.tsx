"use client";

import { useState } from "react";

export function CalculatorFreelancer() {
  const [jaarOmzet, setJaarOmzet] = useState("");
  const [gewensteDagen, setGewensteDagen] = useState("");
  const [uurPerDag, setUurPerDag] = useState("8");
  const tarief =
    jaarOmzet && gewensteDagen && uurPerDag && Number(gewensteDagen) > 0 && Number(uurPerDag) > 0
      ? (Number(jaarOmzet) / (Number(gewensteDagen) * Number(uurPerDag))).toFixed(2)
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-8 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="omzet" className="block text-sm font-medium text-marketing-text">
            Gewenste jaaromzet (€)
          </label>
          <input
            id="omzet"
            type="number"
            min="0"
            step="1000"
            value={jaarOmzet}
            onChange={(e) => setJaarOmzet(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="dagen" className="block text-sm font-medium text-marketing-text">
            Beschikbare werkdagen per jaar
          </label>
          <input
            id="dagen"
            type="number"
            min="1"
            max="260"
            value={gewensteDagen}
            onChange={(e) => setGewensteDagen(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor="uur" className="block text-sm font-medium text-marketing-text">
            Billable uren per dag
          </label>
          <input
            id="uur"
            type="number"
            min="1"
            max="12"
            value={uurPerDag}
            onChange={(e) => setUurPerDag(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-marketing-text focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>
      {tarief !== null && (
        <p className="mt-6 text-2xl font-semibold text-marketing-text">
          Minimaal uurtarief: <span className="text-gold">€{tarief}</span>
        </p>
      )}
    </div>
  );
}
