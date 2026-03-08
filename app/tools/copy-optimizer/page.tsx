import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import CopyOptimizerTool from "@/components/tools/CopyOptimizerTool";

export const metadata = {
  title: "Copy Optimizer | Tekst en headlines verbeteren | VDB Digital",
  description:
    "Plak je tekst en ontvang verbeterde copy, sterkere headlines en betere oproepen tot actie. AI-gestuurde copy-optimalisatie.",
  openGraph: {
    title: "Copy Optimizer — Betere teksten en CTAs | VDB Digital",
    description: "Verbeterde copy, headlines en oproepen tot actie op basis van je tekst.",
  },
};

const LANDING = {
  explanation:
    "De Copy Optimizer neemt je bestaande tekst en stelt verbeteringen voor: sterkere headlines, duidelijkere oproepen tot actie (CTA's) en tips voor leesbaarheid. Handig voor landingspagina's, e-mails of advertentieteksten. Je plakt je copy, de tool geeft een geoptimaliseerde versie terug.",
  benefits: [
    "Verbeterde versie van je tekst in één klik",
    "Sterkere headlines die opvallen",
    "CTAs die duidelijker tot actie uitnodigen",
    "Leesbaarheidstips (zinnen, alinea's)",
    "Direct toepasbaar in je website of campagnes",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Een herschreven versie van je tekst met aangepaste headline en CTA, plus korte toelichting waarom bepaalde wijzigingen zijn gedaan. Je kunt de output kopiëren en direct gebruiken of verder aanpassen.</p>
    </div>
  ),
  internalLinks: [
    { label: "Content Generator", href: "/tools/content-generator" },
    { label: "Conversie Analyzer", href: "/tools/conversion-analyzer" },
    { label: "Kennisbank AI marketing", href: "/kennis/ai-marketing" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function CopyOptimizerPage() {
  return (
    <ToolLayout
      title="Copy Optimizer"
      description="Plak je copy. Ontvang verbeterde tekst, sterkere headlines en betere CTAs. Snel en in het Nederlands."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="Copy Optimizer"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#tool-form"
          toolCta="Start copy optimaliseren"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="tool-form">
        <h2 className="mb-4 text-lg font-semibold text-marketing-text">Tool gebruiken</h2>
        <CopyOptimizerTool />
      </div>
    </ToolLayout>
  );
}
