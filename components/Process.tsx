const steps = [
  {
    label: "01 · Strategie",
    title: "Bepaal wat “onvermijdelijk” voor jou betekent.",
    description:
      "We brengen je proposities, doelgroep en koopreizen in kaart en ontwerpen vervolgens een digitale funnel die aansluit op hoe jij echt verkoopt.",
  },
  {
    label: "02 · Design",
    title: "Maak de interface en het verhaal kloppend.",
    description:
      "Structure, copy, layout and motion crafted together so every screen earns attention instead of asking for it.",
  },
  {
    label: "03 · Build",
    title: "Engineeer de infrastructuur.",
    description:
      "Next.js, modern tooling and robust data models stitched into a calm, resilient system that can grow with you.",
  },
  {
    label: "04 · Schalen",
    title: "Optimaliseren, automatiseren, laten compounding.",
    description:
      "Review systems, analytics and automations layered in so the site keeps improving long after launch.",
  },
];

export default function Process() {
  return (
    <section id="process" className="py-32">
      <div className="section-container">
        <div className="max-w-2xl">
          <p className="section-heading">Proces</p>
          <h2 className="section-title">Een kalm, precies bouwritme.</h2>
          <p className="mt-4 text-sm sm:text-base text-gray-300/90">
            Geen chaos, geen giswerk. Alleen een duidelijke reeks beslissingen,
            reviews en approvals die je team geïnformeerd houdt zonder je elke
            dag in de productie te trekken.
          </p>
        </div>
        <div className="mt-12 border border-white/10 rounded-3xl bg-black/60 p-6 lg:p-8">
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.label} className="relative">
                {index < steps.length - 1 && (
                  <div className="pointer-events-none absolute top-5 right-0 h-px w-full translate-x-1/2 bg-gradient-to-r from-gold/50 to-transparent" />
                )}
                <div className="inline-flex rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-gray-400 uppercase">
                  {step.label}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">
                  {step.title}
                </h3>
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
                className="rounded-2xl border border-white/10 bg-black/70 p-4"
              >
                <div className="inline-flex rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-gray-400 uppercase">
                  {step.label}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-gray-300/90">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

