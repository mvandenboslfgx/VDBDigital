import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata = {
  title: "Marketing Strategie Generator | Strategie op maat | VDB Digital",
  description:
    "Krijg een op maat marketingstrategie met aanbevolen kanalen, prioriteiten en actiepunten. Beschikbaar in het dashboard.",
  openGraph: {
    title: "Marketing Strategie Generator — Strategie op maat | VDB Digital",
    description: "Aanbevolen kanalen, prioriteiten en actiepunten op basis van je doelen.",
  },
};

const LANDING = {
  explanation:
    "De Marketing Strategie Generator maakt op basis van je bedrijf, doelen en doelgroep een strategie op maat. Je krijgt aanbevolen kanalen (bijv. SEO, content, ads), prioriteiten en concrete actiepunten. De tool draait in het dashboard na inloggen.",
  benefits: [
    "Strategie afgestemd op je doelen en doelgroep",
    "Aanbevolen marketingkanalen met prioriteit",
    "Concrete actiepunten om mee te starten",
    "Eén overzicht om je jaar of kwartaal op te plannen",
    "Beschikbaar voor gebruikers met een betaald plan",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Een document met 5–8 aanbevolen kanalen (bijv. LinkedIn, Google Ads, content marketing), per kanaal een korte toelichting en prioriteit, en een lijst met eerste actiepunten. Je kunt het gebruiken als basis voor je marketingplan.</p>
    </div>
  ),
  internalLinks: [
    { label: "Website-audit", href: "/tools/website-audit" },
    { label: "Digitale strategie", href: "/kennis/digitale-strategie" },
    { label: "AI marketing", href: "/kennis/ai-marketing" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function MarketingStrategyPage() {
  return (
    <ToolLayout
      title="Marketing Strategie Generator"
      description="Krijg een marketingstrategie op maat met kanalen, prioriteiten en actiepunten. Beschikbaar in het dashboard na inloggen."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="Marketing Strategie Generator"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#cta-dashboard"
          toolCta="Naar AI-tools in dashboard"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="cta-dashboard" className="rounded-2xl border border-gold/30 bg-gold/5 p-8">
        <p className="text-marketing-textSecondary">
          Log in of maak een account aan om de Marketing Strategie Generator te gebruiken in je dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/dashboard/ai-tools">
            <Button size="md">Naar AI-tools in dashboard</Button>
          </Link>
          <Link href="/create-account">
            <Button size="md" variant="outline">
              Account aanmaken
            </Button>
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
