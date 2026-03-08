import ToolLayout from "@/components/tools/ToolLayout";
import ToolLandingSection from "@/components/tools/ToolLandingSection";
import PerformanceCheckTool from "@/components/tools/PerformanceCheckTool";

export const metadata = {
  title: "Performance Check | Core Web Vitals & snelheid | VDB Digital",
  description:
    "Controleer je website-snelheid. LCP, CLS, FID en andere Core Web Vitals. Concrete performance-tips om sneller te laden.",
  openGraph: {
    title: "Performance Check — Website snelheid | VDB Digital",
    description: "Core Web Vitals en concrete tips voor een snellere website.",
  },
};

const LANDING = {
  explanation:
    "De Performance Check analyseert de snelheid van je website en de Core Web Vitals: LCP (laadtijd van de grootste content), CLS (visuele stabiliteit) en FID/INP (interactiviteit). Je krijgt een overzicht van knelpunten en concrete verbetertips.",
  benefits: [
    "Inzicht in Core Web Vitals (LCP, CLS, FID/INP)",
    "Concrete tips om je site sneller te maken",
    "Belangrijk voor gebruikerservaring en Google-ranking",
    "Geen technische voorkennis nodig",
    "Resultaten direct toepasbaar",
  ],
  exampleTitle: "Voorbeeld output",
  exampleContent: (
    <div className="space-y-2 text-sm">
      <p>Scores per Core Web Vital en een lijst met aanbevelingen (bijv. afbeeldingen optimaliseren, lazy loading, caching). Je ziet waar de grootste winst te behalen is.</p>
    </div>
  ),
  internalLinks: [
    { label: "Website snelheid uitleg", href: "/seo/website-snelheid" },
    { label: "Website-audit", href: "/tools/website-audit" },
    { label: "Kennisbank snelheid", href: "/kennis/website-snelheid" },
    { label: "Alle tools", href: "/tools" },
  ],
};

export default function PerformanceCheckPage() {
  return (
    <ToolLayout
      title="Performance Check"
      description="Controleer je website-snelheid. Core Web Vitals (LCP, CLS, FID) en concrete performance-tips."
    >
      <div className="mb-12">
        <ToolLandingSection
          title="Performance Check"
          explanation={LANDING.explanation}
          benefits={LANDING.benefits}
          exampleTitle={LANDING.exampleTitle}
          exampleContent={LANDING.exampleContent}
          toolHref="#tool-form"
          toolCta="Start performance check"
          internalLinks={LANDING.internalLinks}
        />
      </div>
      <div id="tool-form">
        <h2 className="mb-4 text-lg font-semibold text-marketing-text">Tool gebruiken</h2>
        <PerformanceCheckTool />
      </div>
    </ToolLayout>
  );
}
