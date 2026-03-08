import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { Button } from "@/components/ui";

export const metadata = pageMetadata({
  title: "Prijzen",
  description: "Gratis, Pro, Business en Agency. Website-scans en AI-tools.",
  path: "/pricing",
});

const plans = [
  { name: "Gratis", price: 0, features: ["1 scan per maand", "Basis rapport"], cta: "Account aanmaken", href: "/create-account", highlighted: false },
  { name: "Starter", price: 29, features: ["25 scans per maand", "AI-tools", "Rekenmachines"], cta: "Start Starter", href: "/dashboard/billing?upgrade=starter", highlighted: true },
  { name: "Growth", price: 79, features: ["150 scans per maand", "Meer AI-credits", "Prioriteit"], cta: "Start Growth", href: "/dashboard/billing?upgrade=growth", highlighted: false },
  { name: "Agency", price: 199, features: ["500 scans per maand", "CRM", "Dedicated support"], cta: "Neem contact op", href: "/contact?plan=agency", highlighted: false },
];

export default function PricingPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-heading">Prijzen</p>
          <h1 className="section-title mt-2">
            Eenvoudige plannen.
          </h1>
        </div>
        <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 transition-shadow ${
                plan.highlighted
                  ? "border-gold/30 bg-gold/5 shadow-gold-glow"
                  : "border-white/[0.06] bg-[#111113] shadow-panel hover:border-white/[0.1]"
              }`}
            >
              <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
              <p className="mt-6 text-3xl font-semibold tracking-tight text-white">
                {plan.price === 0 ? "Gratis" : `€${plan.price}`}
                {plan.price > 0 && (
                  <span className="text-sm font-normal text-zinc-500">/maand</span>
                )}
              </p>
              <ul className="mt-6 space-y-2 text-sm text-zinc-400">
                {plan.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <Link href={plan.href} className="mt-8 block">
                <Button
                  variant={plan.highlighted ? "primary" : "ghost"}
                  size="md"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-zinc-500">
          Heb je al een account?{" "}
          <Link href="/login" className="text-gold hover:underline">Inloggen</Link>
          {" · "}
          <Link href="/dashboard" className="text-gold hover:underline">Dashboard</Link>
        </p>
      </div>
    </SiteShell>
  );
}
