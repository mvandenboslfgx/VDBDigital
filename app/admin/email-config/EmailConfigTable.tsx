"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type EmailConfigItem = {
  id: string;
  sourceEmail: string;
  targetEmail: string;
  createdAt: string;
};

export function EmailConfigTable({ list }: { list: EmailConfigItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = search.trim()
    ? list.filter(
        (r) =>
          r.sourceEmail.toLowerCase().includes(search.toLowerCase()) ||
          r.targetEmail.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const handleDelete = async (id: string) => {
    setError(null);
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/email-config/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Verwijderen mislukt");
        return;
      }
      router.refresh();
    } catch {
      setError("Verwijderen mislukt");
    } finally {
      setDeleting(null);
    }
  };

  if (list.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Nog geen e-mailconfiguraties. Voeg er een toe via het formulier.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="sr-only" htmlFor="email-config-search">
          Zoek
        </label>
        <input
          id="email-config-search"
          type="search"
          placeholder="Zoek"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          aria-label="Zoek op e-mailadres"
        />
      </div>
      {error && (
        <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4 font-medium">AANGEMAAKT OP</th>
              <th className="pb-3 pr-4 font-medium">E-MAILADRES</th>
              <th className="pb-3 pr-4 font-medium">DOEL E-MAILADRES</th>
              <th className="pb-3 font-medium w-10"> </th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="py-3 pr-4 text-gray-500">
                  {new Date(row.createdAt).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-3 pr-4 font-medium text-white">{row.sourceEmail}</td>
                <td className="py-3 pr-4">{row.targetEmail}</td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={deleting === row.id}
                    className="rounded p-1.5 text-gray-400 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                    aria-label={`Verwijderen ${row.sourceEmail}`}
                    title="Verwijderen"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-500">Geen resultaten voor &quot;{search}&quot;</p>
      )}
    </div>
  );
}
