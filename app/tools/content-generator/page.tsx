import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import ContentGeneratorTool from "@/components/tools/ContentGeneratorTool";

export const metadata = {
  title: "Content Generator | SEO-artikelen en meta teksten | VDB Digital",
  description:
    "Genereer een SEO-blogartikel, metatitel, meta description en koppen op basis van een onderwerp. Snel en in het Nederlands.",
  openGraph: {
    title: "Content Generator — SEO-artikelen genereren | VDB Digital",
    description: "Blogartikelen, meta title en description op basis van een onderwerp.",
  },
};

const LANDING = {
  explanation:
    "De Content Generator maakt op basis van een onderwerp een SEO-vriendelijk blogartikel met koppen, een metatitel en een meta description. Handig voor blogposts, landingspagina's of wanneer je snel een eerste versie nodig hebt die je daarna kunt aanscherpen.",
  benefits: [
    "Blogartikel met logische koppenstructuur",
    "Meta title en meta description voor zoekmachines",
    "Tekst in het Nederlands, afgestemd op je onderwerp",
    "Snel een eerste versie om verder uit te werken",
    "Minder schrijftijd, meer consistentie",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Een artikel met H2/H3-koppen, alinea's per sectie, een metatitel (ca. 60 tekens) en een meta description (ca. 155 tekens). Je kunt de output direct in je CMS plakken en waar nodig aanpassen.</p>
    </div>
  ),
  internalLinks: [
    { label: "SEO Keyword Finder", href: "/tools/seo-keyword-finder" },
    { label: "Copy Optimizer", href: "/tools/copy-optimizer" },
    { label: "Kennisbank SEO", href: "/kennis/seo" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function ContentGeneratorPage() {
  return (
    <ToolLayout
      title="Content Generator"
      description="Genereer een SEO-blogartikel, metatitel en meta description op basis van een onderwerp. In het Nederlands."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="Content Generator"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#tool-form"
          toolCta="Start content genereren"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="tool-form">
        <h2 className="mb-4 text-lg font-semibold text-marketing-text">Tool gebruiken</h2>
        <ContentGeneratorTool />
      </div>
    </ToolLayout>
  );
}
