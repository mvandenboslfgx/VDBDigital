import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { CalculatorRoi } from "./CalculatorRoi";
import { CalculatorBreakEven } from "./CalculatorBreakEven";
import { CalculatorPrijsverhoging } from "./CalculatorPrijsverhoging";
import { CalculatorFreelancer } from "./CalculatorFreelancer";
import { CalculatorKorting } from "./CalculatorKorting";
import { CalculatorAbonnement } from "./CalculatorAbonnement";

const CALCULATORS: Record<string, { title: string; description: string }> = {
  roi: { title: "ROI calculator", description: "Bereken het rendement op je investering (ROI %)." },
  "break-even": { title: "Break-even calculator", description: "Bepaal het break-even punt op basis van vaste en variabele kosten." },
  prijsverhoging: { title: "Prijsverhoging calculator", description: "Zie de impact van een prijsverhoging op omzet en marge." },
  "freelancer-tarief": { title: "Freelancer uurtarief", description: "Bereken je minimaal benodigde uurtarief." },
  kortingsimpact: { title: "Kortingsimpact", description: "Wat doet een korting met je marge en omzet?" },
  "abonnement-vs-eenmalig": { title: "Abonnement vs eenmalig", description: "Vergelijk recurring en eenmalige omzet." },
};

export async function generateStaticParams() {
  return Object.keys(CALCULATORS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = CALCULATORS[slug];
  if (!data) return {};
  return pageMetadata({
    title: data.title,
    description: data.description,
    path: `/calculators/${slug}`,
  });
}

function CalculatorContent({ slug }: { slug: string }) {
  switch (slug) {
    case "roi":
      return <CalculatorRoi />;
    case "break-even":
      return <CalculatorBreakEven />;
    case "prijsverhoging":
      return <CalculatorPrijsverhoging />;
    case "freelancer-tarief":
      return <CalculatorFreelancer />;
    case "kortingsimpact":
      return <CalculatorKorting />;
    case "abonnement-vs-eenmalig":
      return <CalculatorAbonnement />;
    default:
      return null;
  }
}

export default async function CalculatorSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = CALCULATORS[slug];
  if (!data) notFound();

  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <Link
          href="/calculators"
          className="text-sm font-medium text-marketing-textSecondary hover:text-marketing-text transition-colors"
        >
          ← Calculators
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
          {data.title}
        </h1>
        <p className="mt-2 text-lg text-marketing-textSecondary">{data.description}</p>
        <div className="mt-12 max-w-xl">
          <CalculatorContent slug={slug} />
        </div>
        <div className="mt-12">
          <Link
            href="/calculators"
            className="text-gold font-medium hover:text-goldHover transition-colors"
          >
            ← Alle calculators
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
