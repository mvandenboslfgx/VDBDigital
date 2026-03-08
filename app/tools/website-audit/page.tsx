import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import WebsiteAuditTool from "@/components/tools/WebsiteAuditTool";

export const metadata = {
  title: "Website-audit | Gratis SEO, performance en UX analyse | VDB Digital",
  description:
    "Analyseer je website gratis op SEO, performance, UX en conversie. Ontvang scores, verbeterpunten en technische inzichten. Start binnen 60 seconden.",
  openGraph: {
    title: "Website-audit — Gratis website analyse | VDB Digital",
    description: "SEO, performance, UX en conversie-scores met concrete aanbevelingen.",
  },
};

const LANDING = {
  explanation:
    "De website-audit scant je URL en analyseert titels, meta, koppen, afbeeldingen, snelheid en conversie-elementen. Je krijgt vier scores (SEO, performance, UX, conversie) en een rapport met verbeterpunten die je direct kunt toepassen.",
  benefits: [
    "Duidelijke scores van 0–100 voor SEO, performance, UX en conversie",
    "Concrete verbeterpunten met prioriteit",
    "Technische data: H1/H2, alt-teksten, links, viewport",
    "Deelbaar rapport voor klanten of team",
    "Geen installatie; werkt direct in de browser",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Totaalscore: 78/100</p>
      <p>SEO 82 · Performance 75 · UX 80 · Conversie 76</p>
      <p className="mt-2 text-marketing-textSecondary">
        Het rapport bevat een samenvatting, aanbevelingen per categorie en optioneel technische details. Je kunt het rapport delen via een link of als PDF downloaden.
      </p>
    </div>
  ),
  internalLinks: [
    { label: "SEO-check uitleg", href: "/seo/seo-check" },
    { label: "Website snelheid", href: "/seo/website-snelheid" },
    { label: "Kennisbank SEO", href: "/kennis/seo" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function WebsiteAuditPage() {
  return (
    <ToolLayout
      title="Website-audit"
      description="Analyseer je website op SEO, performance, UX en conversie. Ontvang binnen een minuut scores, verbeterpunten en een deelbaar rapport."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="Website-audit"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#scan-form"
          toolCta="Start website-audit"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="scan-form">
        <h2 className="text-lg font-semibold text-marketing-text mb-4">Audit starten</h2>
        <WebsiteAuditTool />
      </div>
    </ToolLayout>
  );
}
