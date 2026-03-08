"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

const ALLOWED = ["starter", "growth", "agency", "pro", "business"] as const;

const LABELS: Record<string, string> = {
  starter: "Start Starter (€29/maand)",
  growth: "Start Growth (€79/maand)",
  agency: "Neem contact op (Agency)",
  pro: "Start Starter (€29/maand)",
  business: "Start Growth (€79/maand)",
};

export default function UpgradeCheckoutButton() {
  const searchParams = useSearchParams();
  const upgrade = searchParams.get("upgrade")?.toLowerCase();
  const [loading, setLoading] = useState(false);

  if (!upgrade || !ALLOWED.includes(upgrade as (typeof ALLOWED)[number])) return null;
  if (upgrade === "agency") {
    return (
      <a href="/contact?plan=agency">
        <Button size="md">Neem contact op (Agency)</Button>
      </a>
    );
  }

  async function startCheckout() {
    setLoading(true);
    try {
      const plan = upgrade === "pro" ? "starter" : upgrade === "business" ? "growth" : upgrade;
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string };
      if (data?.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  const label = LABELS[upgrade] ?? "Upgrade";
  return (
    <Button size="md" onClick={startCheckout} disabled={loading}>
      {loading ? "Openen…" : label}
    </Button>
  );
}
