import Link from "next/link";

const electricianCase = {
  name: "De Elektricien",
  industry: "Lokale diensten",
  metric: "Stabiele stroom aan leads",
  quote:
    "VDB Digital heeft onze online aanwezigheid omgebouwd tot een rustige, contact-first ervaring. Klanten weten nu binnen seconden wat we doen en hoe ze ons kunnen bereiken.",
};

export default function CaseStudies() {
  return (
    <section id="cases" className="py-32">
      <div className="section-container">
        <div className="max-w-2xl">
          <p className="section-heading">Geselecteerde case</p>
          <h2 className="section-title">
            Hoe “onvermijdelijk” voelt voor een lokale elektricien.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-300/90">
            We werken met teams die de hele funnel serieus nemen—van eerste
            indruk tot ondertekend voorstel. Hieronder lichten we één case uit:
            De Elektricien.
          </p>
        </div>
        <div className="mt-12">
          <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#151515] via-black to-black p-7 shadow-[0_28px_70px_rgba(0,0,0,0.95)]">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {electricianCase.name}
                </h3>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mt-1">
                  {electricianCase.industry}
                </p>
              </div>
              <div className="rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
                {electricianCase.metric}
              </div>
            </header>
            <p className="mt-6 text-sm text-gray-300/90 max-w-xl">
              {electricianCase.quote}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
              <p>Contact-first structuur · Rustige, lokaal vertrouwde presence</p>
              <div className="flex gap-4">
                <Link
                  href="/work/de-elektricien"
                  className="text-gold hover:text-gold/80 underline-offset-4 hover:underline"
                >
                  Bekijk volledige case
                </Link>
                <Link
                  href="/work"
                  className="text-gray-400 hover:text-gold underline-offset-4 hover:underline"
                >
                  Alle cases
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

