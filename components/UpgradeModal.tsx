"use client";

import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

const plans = [
  {
    name: "Gratis",
    price: "€0",
    period: "/maand",
    features: ["2 website-scans per maand", "Dashboard-toegang", "Altijd upgraden"],
    cta: "Huidig",
    href: "#",
    current: true,
  },
  {
    name: "Pro",
    price: "€29",
    period: "/maand",
    features: ["25 website-scans per maand", "Alle AI-tools", "Volledige rapporten"],
    cta: "Upgrade naar Pro",
    href: "/pricing",
    highlight: true,
  },
  {
    name: "Agency",
    price: "€299",
    period: "/maand",
    features: ["Onbeperkte scans", "Prioriteit support", "API-toegang"],
    cta: "Neem contact op",
    href: "/contact?plan=agency",
  },
];

export default function UpgradeModal({ open, onClose, message }: Props) {
  const handleUpgradeClick = () => {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "upgrade_clicked" }),
    }).catch(() => {});
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Je hebt je maandelijkse auditlimiet bereikt
        </h2>
        <p className="text-sm text-zinc-400">
          {message ?? "Je hebt deze maand je limiet bereikt. Upgrade om meer scans te doen en AI-tools te ontgrendelen."}
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-4 ${
                plan.highlight
                  ? "border-gold/40 bg-gold/10"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <p className="text-sm font-semibold text-white">{plan.name}</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {plan.price}
                <span className="text-sm font-normal text-zinc-500">{plan.period}</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-400">
                {plan.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              {plan.cta === "Huidig" ? (
                <p className="mt-4 text-xs text-zinc-500">Huidig plan</p>
              ) : (
                <Link
                  href={plan.href}
                  onClick={() => {
                    handleUpgradeClick();
                    onClose();
                  }}
                  className={`mt-4 flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    plan.highlight
                      ? "bg-gold text-black hover:shadow-[0_0_20px_4px_rgba(198,169,93,0.5)]"
                      : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/pricing"
            onClick={() => {
              handleUpgradeClick();
              onClose();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 text-sm font-medium text-black transition-all hover:shadow-[0_0_20px_4px_rgba(198,169,93,0.5)]"
          >
            Bekijk prijzen
          </Link>
          <Button type="button" variant="ghost" onClick={onClose}>
            Sluiten
          </Button>
        </div>
      </div>
    </Modal>
  );
}
