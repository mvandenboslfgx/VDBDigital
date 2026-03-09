import dynamic from "next/dynamic";
import SiteShell from "@/components/SiteShell";
import HeroSection from "@/components/home/HeroSection";
import TrustSection from "@/components/home/TrustSection";
import WebsiteScanSection from "@/components/home/WebsiteScanSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ExampleReportSection from "@/components/home/ExampleReportSection";
import ToolkitSection from "@/components/home/ToolkitSection";
import HardwarePreviewSection from "@/components/home/HardwarePreviewSection";
import KnowledgeHubSection from "@/components/home/KnowledgeHubSection";
import PricingStrip from "@/components/home/PricingStrip";
import FinalCtaSection from "@/components/home/FinalCtaSection";

const FAQSection = dynamic(
  () => import("@/components/home/FAQSection").then((m) => ({ default: m.default })),
  { ssr: true }
);

export default function HomePage() {
  return (
    <SiteShell>
      <section className="bg-surface" aria-label="Hero">
        <HeroSection />
      </section>
      <section className="bg-[#EEF1F5]" aria-label="Vertrouwen">
        <TrustSection />
      </section>
      <section className="bg-surface" aria-label="Website scan">
        <WebsiteScanSection />
      </section>
      <section className="bg-[#EEF1F5]" aria-label="Hoe het werkt">
        <HowItWorksSection />
      </section>
      <section className="bg-surface" aria-label="Rapport preview">
        <ExampleReportSection />
      </section>
      <section className="bg-[#EEF1F5]" aria-label="Tools">
        <ToolkitSection />
      </section>
      <section className="bg-surface" aria-label="Apparaten">
        <HardwarePreviewSection />
      </section>
      <section className="bg-[#EEF1F5]" aria-label="Kennisbank">
        <KnowledgeHubSection />
      </section>
      <section className="bg-[#EEF1F5]" aria-label="Prijzen">
        <PricingStrip />
      </section>
      <section className="bg-surface" aria-label="FAQ">
        <FAQSection />
      </section>
      <section className="bg-[#EEF1F5]" aria-label="CTA">
        <FinalCtaSection />
      </section>
    </SiteShell>
  );
}
