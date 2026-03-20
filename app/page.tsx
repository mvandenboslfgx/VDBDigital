import dynamic from "next/dynamic";
import SiteShell from "@/components/SiteShell";
import HeroSection from "@/components/home/HeroSection";
import TrustSection from "@/components/home/TrustSection";
import WebsiteScanSection from "@/components/home/WebsiteScanSection";
import ProblemValueSection from "@/components/home/ProblemValueSection";
import PreviewSection from "@/components/home/PreviewSection";

const HowItWorksSection = dynamic(
  () => import("@/components/home/HowItWorksSection").then((m) => ({ default: m.default })),
  { ssr: true }
);
const ExampleReportSection = dynamic(
  () => import("@/components/home/ExampleReportSection").then((m) => ({ default: m.default })),
  { ssr: true }
);
const ToolkitSection = dynamic(
  () => import("@/components/home/ToolkitSection").then((m) => ({ default: m.default })),
  { ssr: true }
);
const HardwarePreviewSection = dynamic(
  () => import("@/components/home/HardwarePreviewSection").then((m) => ({ default: m.default })),
  { ssr: true }
);
const KnowledgeHubSection = dynamic(
  () => import("@/components/home/KnowledgeHubSection").then((m) => ({ default: m.default })),
  { ssr: true }
);
const PricingStrip = dynamic(
  () => import("@/components/home/PricingStrip").then((m) => ({ default: m.default })),
  { ssr: true }
);
const FAQSection = dynamic(
  () => import("@/components/home/FAQSection").then((m) => ({ default: m.default })),
  { ssr: true }
);
const FinalCtaSection = dynamic(
  () => import("@/components/home/FinalCtaSection").then((m) => ({ default: m.default })),
  { ssr: true }
);
const Reviews = dynamic(
  () => import("@/components/home/Reviews").then((m) => ({ default: m.default })),
  { ssr: true }
);

export default function HomePage() {
  return (
    <SiteShell>
      <section className="bg-white" aria-label="Hero">
        <HeroSection />
      </section>
      <section className="bg-indigo-50" aria-label="Resultaat preview">
        <PreviewSection />
      </section>
      <section className="bg-indigo-50" aria-label="Vertrouwen">
        <TrustSection />
      </section>
      <section className="bg-white" aria-label="Probleem en resultaat">
        <ProblemValueSection />
      </section>
      <section className="bg-white" aria-label="Website scan">
        <WebsiteScanSection />
      </section>
      <section className="bg-indigo-50" aria-label="Hoe het werkt">
        <HowItWorksSection />
      </section>
      <section className="bg-white" aria-label="Rapport preview">
        <ExampleReportSection />
      </section>
      <section className="bg-indigo-50" aria-label="Tools">
        <ToolkitSection />
      </section>
      <section className="bg-white" aria-label="Apparaten">
        <HardwarePreviewSection />
      </section>
      <section className="bg-indigo-50" aria-label="Kennisbank">
        <KnowledgeHubSection />
      </section>
      <section className="bg-indigo-50" aria-label="Prijzen">
        <PricingStrip />
      </section>
      <section className="bg-indigo-50" aria-label="Reviews">
        <Reviews />
      </section>
      <section className="bg-white" aria-label="FAQ">
        <FAQSection />
      </section>
      <section className="bg-indigo-50" aria-label="CTA">
        <FinalCtaSection />
      </section>
    </SiteShell>
  );
}
