import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { Button } from "@/components/ui";
import UpgradeTrackLink from "@/components/analytics/UpgradeTrackLink";

export const metadata = pageMetadata({
  title: "Prijzen – AI Website Analyse & Conversie Optimalisatie",
  description: "Gratis, Starter, Pro en Agency. Website-scans en AI-tools voor elk budget. Ontdek waarom je website geen klanten oplevert.",
  path: "/prijzen",
});

const plans = [
  {
    name: "Gratis",
    price: 0,
    features: ["1 scan per maand", "Basis rapport", "Technische data"],
    cta: "Account aanmaken",
    href: "/create-account",
    highlighted: false,
  },
  {
    name: "Starter",
    price: 29,
    features: ["25 scans per maand", "AI-tools", "Rekenmachines"],
    cta: "Start Starter",
    href: "/dashboard/billing?upgrade=starter",
    highlighted: true,
  },
  {
    name: "Growth",
    price: 79,
    features: ["150 scans per maand", "Meer AI-credits", "Prioriteit"],
    cta: "Start Growth",
    href: "/dashboard/billing?upgrade=growth",
    highlighted: false,
  },
  {
    name: "Agency",
    price: 199,
    features: ["500 scans per maand", "CRM", "Dedicated support"],
    cta: "Neem contact op",
    href: "/contact?plan=agency",
    highlighted: false,
  },
];

export default function PrijzenPage() {
  return (
    <SiteShell>
      <div className="section-container py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prijzen</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Eenvoudige plannen.</h1>
          <p className="mt-4 text-lg text-slate-600">
            Start gratis met een website analyse. Upgrade alleen als u meer inzichten wilt.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md relative ${
                plan.highlighted
                  ? "border-indigo-200 ring-2 ring-indigo-500/20 -translate-y-1"
                  : "border-gray-200 hover:-translate-y-1.5"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  MEEST GEKOZEN
                </span>
              )}
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
                {plan.price === 0 ? "Gratis" : `€${plan.price}`}
                {plan.price > 0 && (
                  <span className="text-sm font-normal text-slate-500">/maand</span>
                )}
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <UpgradeTrackLink href={plan.href} plan={plan.name} className="mt-8 block">
                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  size="md"
                  className="w-full min-h-[44px]"
                >
                  {plan.cta}
                </Button>
              </UpgradeTrackLink>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-slate-600">
          Heeft u al een account?{" "}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">Inloggen</Link>
          {" · "}
          <Link href="/dashboard" className="text-indigo-600 font-medium hover:underline">Dashboard</Link>
        </p>
      </div>
    </SiteShell>
  );
}
