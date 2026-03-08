"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlanEditorProps {
  planId: string;
  planName: string;
  price: number;
  aiLimit: number;
  calculatorLimit: number;
  projectLimit: number;
}

export function PlanEditor({
  planId,
  planName,
  price,
  aiLimit,
  calculatorLimit,
  projectLimit,
}: PlanEditorProps) {
  const router = useRouter();
  const [p, setP] = useState(price);
  const [ai, setAi] = useState(aiLimit);
  const [calc, setCalc] = useState(calculatorLimit);
  const [proj, setProj] = useState(projectLimit);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/plans/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          price: p,
          aiLimit: ai,
          calculatorLimit: calc,
          projectLimit: proj,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Update failed");
      setMessage("Saved.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 text-sm">
      <div>
        <label className="block text-xs text-gray-500">Price (cents)</label>
        <input
          type="number"
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          className="mt-1 w-full rounded border border-white/20 bg-black/60 px-3 py-1.5 text-white"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500">AI limit</label>
        <input
          type="number"
          value={ai}
          onChange={(e) => setAi(Number(e.target.value))}
          className="mt-1 w-full rounded border border-white/20 bg-black/60 px-3 py-1.5 text-white"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Calculator limit</label>
        <input
          type="number"
          value={calc}
          onChange={(e) => setCalc(Number(e.target.value))}
          className="mt-1 w-full rounded border border-white/20 bg-black/60 px-3 py-1.5 text-white"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Project limit</label>
        <input
          type="number"
          value={proj}
          onChange={(e) => setProj(Number(e.target.value))}
          className="mt-1 w-full rounded border border-white/20 bg-black/60 px-3 py-1.5 text-white"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="rounded bg-amber-500/20 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/30"
      >
        {loading ? "Saving…" : "Update"}
      </button>
      {message && (
        <p className={`text-xs ${message === "Saved." ? "text-emerald-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
