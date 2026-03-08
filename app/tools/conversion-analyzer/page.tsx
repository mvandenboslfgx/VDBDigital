import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import ConversionAnalyzerTool from "@/components/tools/ConversionAnalyzerTool";

export const metadata = {
  title: "Conversie Analyzer | CTA's en formulieren verbeteren | VDB Digital",
  description:
    "Analyseer CTA's, vertrouwenselementen, paginastructuur en formulieren. Krijg verbetervoorstellen voor meer conversie.",
  openGraph: {
    title: "Conversie Analyzer — Meer conversie uit je website | VDB Digital",
    description: "CTA's, vertrouwen en formulieren analyseren voor betere conversie.",
  },
};

const LANDING = {
  explanation:
    "De Conversie Analyzer bekijkt je website op elementen die bezoekers tot actie moeten brengen: calls-to-action (CTA's), vertrouwenselementen (reviews, garanties), paginastructuur en formulieren. Je krijgt een beoordeling en concrete verbetervoorstellen om meer leads of verkopen te realiseren.",
  benefits: [
    "Beoordeling van CTA's en duidelijke verbetertips",
    "Inzicht in vertrouwenselementen en social proof",
    "Analyse van paginastructuur en focus",
    "Formulieroptimalisatie (velden, foutafhandeling)",
    "Praktische aanbevelingen die je direct kunt toepassen",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Een overzicht van sterke en zwakke punten op het gebied van conversie, met per punt een korte uitleg en suggestie. Bijvoorbeeld: CTA-tekst duidelijker maken of een trust badge toevoegen.</p>
    </div>
  ),
  internalLinks: [
    { label: "Website-audit", href: "/tools/website-audit" },
    { label: "Kennisbank conversie", href: "/kennis/conversie-optimalisatie" },
    { label: "Content Generator", href: "/tools/content-generator" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function ConversionAnalyzerPage() {
  return (
    <ToolLayout
      title="Conversie Analyzer"
      description="Analyseer CTA's, vertrouwenselementen, paginastructuur en formulieren. Krijg verbetervoorstellen voor meer conversie."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="Conversie Analyzer"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#tool-form"
          toolCta="Start conversie-analyse"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="tool-form">
        <h2 className="mb-4 text-lg font-semibold text-marketing-text">Tool gebruiken</h2>
        <ConversionAnalyzerTool />
      </div>
    </ToolLayout>
  );
}
