import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import SeoKeywordFinderTool from "@/components/tools/SeoKeywordFinderTool";

export const metadata = {
  title: "SEO Keyword Finder | Gratis zoekwoorden vinden | VDB Digital",
  description:
    "Vind zoekwoorden en content-ideeën op basis van je website of een keyword. Zoekintentie en suggesties. Gratis te gebruiken.",
  openGraph: {
    title: "SEO Keyword Finder — Zoekwoorden en content-ideeën | VDB Digital",
    description: "Keyword-ideeën, zoekintentie en content-suggesties op basis van je site of keyword.",
  },
};

const LANDING = {
  explanation:
    "De SEO Keyword Finder helpt je relevante zoekwoorden te vinden voor je content en campagnes. Voer een website-URL of een startkeyword in; de tool levert keyword-ideeën, zoekintentie (informatief, transactioneel, etc.) en suggesties voor content.",
  benefits: [
    "Keyword-ideeën op basis van je website of een keyword",
    "Inzicht in zoekintentie per keyword",
    "Content-suggesties die aansluiten op wat mensen zoeken",
    "Handig voor blogposts, landingspagina's en advertenties",
    "Werkt in het Nederlands",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Keywords met zoekintentie (informatief, transactioneel) en korte content-ideeën per keyword. Je kunt de resultaten direct gebruiken voor je contentplanning of SEO-strategie.</p>
    </div>
  ),
  internalLinks: [
    { label: "SEO-check", href: "/seo/seo-check" },
    { label: "Website-audit", href: "/tools/website-audit" },
    { label: "Kennisbank SEO", href: "/kennis/seo" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function SeoKeywordFinderPage() {
  return (
    <ToolLayout
      title="SEO Keyword Finder"
      description="Vind zoekwoorden en content-ideeën op basis van je website of een keyword. Inclusief zoekintentie en suggesties."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="SEO Keyword Finder"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#tool-form"
          toolCta="Start keyword finder"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="tool-form">
        <h2 className="mb-4 text-lg font-semibold text-marketing-text">Tool gebruiken</h2>
        <SeoKeywordFinderTool />
      </div>
    </ToolLayout>
  );
}
