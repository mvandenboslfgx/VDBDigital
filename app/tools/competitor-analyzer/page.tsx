import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import CompetitorAnalyzerTool from "@/components/tools/CompetitorAnalyzerTool";

export const metadata = {
  title: "Concurrentie Analyzer | Vergelijk met concurrenten | VDB Digital",
  description:
    "Vergelijk je website met een concurrent op SEO, content, UX en conversie. Ontdek voordelen en verbeterpunten.",
  openGraph: {
    title: "Concurrentie Analyzer — Vergelijk met concurrenten | VDB Digital",
    description: "SEO, content, UX en conversie vergelijken met een concurrent.",
  },
};

const LANDING = {
  explanation:
    "De Concurrentie Analyzer vergelijkt je website met die van een concurrent. Je voert beide URL's in en krijgt een vergelijking op SEO (titels, meta, koppen), content, gebruikerservaring (UX) en conversie-elementen. Zo zie je waar je sterker of zwakker bent en waar je kunt verbeteren.",
  benefits: [
    "Directe vergelijking met een concurrent",
    "Inzicht in SEO-, content- en UX-verschillen",
    "Conversie-elementen naast elkaar",
    "Concrete verbeterpunten om de concurrent voor te blijven",
    "Handig voor positionering en contentstrategie",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Een overzicht met per onderdeel (SEO, content, UX, conversie) hoe jouw site en die van de concurrent scoren, plus aanbevelingen waar jij kunt winnen. Ideaal voor een competitieve analyse of een pitch.</p>
    </div>
  ),
  internalLinks: [
    { label: "Website-audit", href: "/tools/website-audit" },
    { label: "SEO-check", href: "/seo/seo-check" },
    { label: "Kennisbank digitale strategie", href: "/kennis/digitale-strategie" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function CompetitorAnalyzerPage() {
  return (
    <ToolLayout
      title="Concurrentie Analyzer"
      description="Vergelijk je website met een concurrent op SEO, content, UX en conversie. Ontdek kansen en verbeterpunten."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="Concurrentie Analyzer"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#tool-form"
          toolCta="Start concurrentie-analyse"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="tool-form">
        <h2 className="mb-4 text-lg font-semibold text-marketing-text">Tool gebruiken</h2>
        <CompetitorAnalyzerTool />
      </div>
    </ToolLayout>
  );
}
