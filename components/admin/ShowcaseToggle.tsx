"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  showcase: boolean;
};

export function ShowcaseToggle({ projectId, showcase: initial }: Props) {
  const [showcase, setShowcase] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showcase: !showcase }),
      });
      if (res.ok) {
        setShowcase(!showcase);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        showcase
          ? "bg-gold/20 text-gold border border-gold/40"
          : "bg-white/5 text-gray-400 border border-white/10 hover:border-gold/40 hover:text-gold"
      } disabled:opacity-50`}
    >
      {loading ? "…" : showcase ? "Showcase" : "Set showcase"}
    </button>
  );
}
