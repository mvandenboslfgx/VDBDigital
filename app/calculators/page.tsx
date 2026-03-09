import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

const CALCULATORS = [
  { slug: "roi", title: "ROI calculator", description: "Bereken het rendement op je investering.", href: "/calculators/roi" },
  { slug: "break-even", title: "Break-even calculator", description: "Bepaal wanneer je break-even draait.", href: "/calculators/break-even" },
  { slug: "prijsverhoging", title: "Prijsverhoging calculator", description: "Impact van een prijsverhoging op omzet en marge.", href: "/calculators/prijsverhoging" },
  { slug: "freelancer-tarief", title: "Freelancer uurtarief", description: "Bereken je minimaal benodigde uurtarief.", href: "/calculators/freelancer-tarief" },
  { slug: "kortingsimpact", title: "Kortingsimpact", description: "Wat doet een korting met je marge?", href: "/calculators/kortingsimpact" },
  { slug: "abonnement-vs-eenmalig", title: "Abonnement vs eenmalig", description: "Vergelijk recurring en eenmalige omzet.", href: "/calculators/abonnement-vs-eenmalig" },
];

export const metadata = pageMetadata({
  title: "Calculators",
  description: "Bedrijfscalculators: ROI, break-even, prijsverhoging, freelancer-tarief, kortingsimpact en abonnement vs eenmalig.",
  path: "/calculators",
});

export default function CalculatorsPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-marketing-text md:text-5xl">
            Bedrijfscalculators
          </h1>
          <p className="mt-6 text-lg text-marketing-textSecondary">
            ROI, break-even, prijsimpact, uurtarief en meer. Interactieve tools om snelle beslissingen te onderbouwen.
          </p>
        </div>
        <div className="mx-auto mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.slug}
              href={calc.href}
              className="group rounded-2xl border border-slate-200 bg-surface p-8 shadow-sm transition-all hover:border-gold/30 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-marketing-text group-hover:text-gold transition-colors">
                {calc.title}
              </h2>
              <p className="mt-3 text-lg text-marketing-textSecondary">
                {calc.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-gold">Gebruik calculator →</span>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
