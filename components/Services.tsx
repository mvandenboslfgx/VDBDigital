import { ReactNode } from "react";
import Link from "next/link";

const services: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "Premium websiteontwikkeling",
    description:
      "Flagship-marketingwebsites, productlanceringen en merkplatformen die moeiteloos voelen om door te gaan en onmogelijk zijn om te vergeten.",
    icon: (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold text-lg">
        ▣
      </span>
    ),
  },
  {
    title: "Review- & reputatiesystemen",
    description:
      "Doordachte reviewflows, QR-ervaringen en on-site social proof die beslissingen stilletjes jouw kant op laten vallen.",
    icon: (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold text-lg">
        ✶
      </span>
    ),
  },
  {
    title: "Conversie-optimalisatie & automatisering",
    description:
      "Funnels, automatiseringen en analytics afgestemd op hoe jouw bedrijf echt werkt, niet op hoe templates dat veronderstellen.",
    icon: (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold text-lg">
        ↗
      </span>
    ),
  },
];

export const Services = () => {
  return (
    <section id="services" className="py-32">
      <div className="section-container">
        <div className="max-w-2xl">
          <p className="section-heading">Diensten</p>
          <h2 className="section-title">
            De infrastructuur achter onvermijdelijke merken.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-300/90">
            We combineren diep strategisch denken met nauwkeurige uitvoering om
            websites te bouwen die zich gedragen als omzetinfrastructuur, niet
            als online brochures. Inclusief <Link href="/builder" className="text-gold hover:underline">AI-websitebuilder</Link>, <Link href="/audit" className="text-gold hover:underline">website-audits</Link> en <Link href="/services" className="text-gold hover:underline">meer diensten</Link>.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#181818] via-black to-black/95 p-7 shadow-[0_22px_50px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/70 hover:shadow-gold-glow"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_0_0,rgba(198,169,93,0.3),transparent_60%)]" />
              <div className="relative space-y-5">
                {service.icon}
                <h3 className="text-lg font-semibold text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-300/90">
                  {service.description}
                </p>
                <div className="mt-4 h-px w-12 bg-gradient-to-r from-gold/80 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

