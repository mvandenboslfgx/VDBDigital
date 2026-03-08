import SiteShell from "@/components/SiteShell";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Proces",
  description:
    "Hoe we werken: strategie, design, build en schalen. Een kalm, transparant projectritme voor digitale infrastructuur.",
  path: "/process",
});

const steps = [
  {
    label: "01 · Strategie",
    title: "Positionering en digitale architectuur.",
    description:
      "We brengen je proposities, doelgroep en koopreizen in kaart en definiëren vervolgens de digitale structuur die nodig is om die te ondersteunen.",
  },
  {
    label: "02 · Design",
    title: "Interface, verhaal en beweging.",
    description:
      "Copy, layout and interaction are composed together so every screen has a clear purpose and a single primary action.",
  },
  {
    label: "03 · Build",
    title: "De infrastructuur engineeren.",
    description:
      "We implement the system on modern tooling, with a focus on stability, performance and ease of long-term maintenance.",
  },
  {
    label: "04 · Schalen",
    title: "Optimalisatie en automatisering.",
    description:
      "Review systems, analytics and automations are layered in so your website continues to compound results after launch.",
  },
];

export default function ProcessPage() {
  return (
    <SiteShell>
      <PageTransition>
        <PageHero
          eyebrow="PROCES"
          title="Een kalm, precies projectritme."
          subtitle="We draaien projecten als infrastructuurinitiatieven, niet als eenmalige campagnes—gestructureerd, transparant en in een tempo waarbij je team geïnformeerd blijft zonder de productie in getrokken te worden."
        />
        <section className="pb-28">
          <div className="section-container">
            <div className="border border-white/10 rounded-3xl bg-black/70 p-6 lg:p-9 shadow-[0_26px_70px_rgba(0,0,0,0.95)]">
              <div className="hidden lg:grid grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={step.label} className="relative">
                    {index < steps.length - 1 && (
                      <div className="pointer-events-none absolute top-6 right-0 h-px w-full translate-x-1/2 bg-gradient-to-r from-gold/50 to-transparent" />
                    )}
                    <div className="inline-flex rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-gray-400 uppercase">
                      {step.label}
                    </div>
                    <h2 className="mt-4 text-sm font-semibold text-white">
                      {step.title}
                    </h2>
                    <p className="mt-3 text-xs text-gray-300/90">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 lg:hidden">
                {steps.map((step) => (
                  <div
                    key={step.label}
                    className="rounded-2xl border border-white/10 bg-black/80 p-4"
                  >
                    <div className="inline-flex rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-gray-400 uppercase">
                      {step.label}
                    </div>
                    <h2 className="mt-3 text-sm font-semibold text-white">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-xs text-gray-300/90">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </PageTransition>
    </SiteShell>
  );
}

