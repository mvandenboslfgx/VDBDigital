import dynamic from "next/dynamic";
import SiteShell from "@/components/SiteShell";
import HeroSection from "@/components/home/HeroSection";
import TrustSection from "@/components/home/TrustSection";
import WebsiteScanSection from "@/components/home/WebsiteScanSection";

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
      <section className="bg-slate-50" aria-label="Reviews">
        <Reviews />
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
