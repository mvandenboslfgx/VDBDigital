import Link from "next/link";

const packages = [
  {
    name: "Starter",
    price: "€899",
    description: "A refined launchpad for ambitious brands.",
    features: [
      "Bespoke one-page luxury layout",
      "Mobile-first responsive design",
      "Copy guidance & structure",
      "Launch-ready in 2–3 weeks",
    ],
    highlighted: false,
  },
  {
    name: "Business",
    price: "€1,999",
    description: "Our most popular full-funnel website package.",
    features: [
      "Up to 8 bespoke pages",
      "Conversion-focused UX & messaging",
      "Integrated review & lead capture flows",
      "Analytics & performance tuning",
    ],
    highlighted: true,
  },
  {
    name: "Elite",
    price: "€4,999",
    description: "For flagship brands and complex experiences.",
    features: [
      "Unlimited page templates",
      "Advanced interactions & animations",
      "Custom integrations & automations",
      "Priority support & iteration cycle",
    ],
    highlighted: false,
  },
];

export const Packages = () => {
  return (
    <section id="packages" className="py-32">
      <div className="section-container">
        <div className="max-w-2xl">
          <p className="section-heading">Packages</p>
          <h2 className="section-title">Simple, transparent investment.</h2>
          <p className="mt-4 text-sm sm:text-base text-gray-300">
            Three tiers, one standard: uncompromising quality. Every package is
            carefully scoped for brands that value both aesthetics and
            performance.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`glass-panel relative flex flex-col justify-between border-white/10 bg-gradient-to-b from-[#181818] via-black to-black/95 p-7 shadow-[0_24px_60px_rgba(0,0,0,0.95)] rounded-3xl ${
                pkg.highlighted ? "ring-1 ring-gold/80 shadow-gold-glow bg-gradient-to-b from-gold/10 via-black to-black" : ""
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute right-5 top-5 rounded-full bg-gold/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
                  Most popular
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {pkg.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400">{pkg.description}</p>
                <p className="mt-4 text-3xl font-semibold text-gold">
                  {pkg.price}
                  <span className="text-xs font-normal text-gray-400">
                    {" "}
                    · one-time
                  </span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-200">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/contact" className="btn-primary w-full text-center">
                  Discuss this package
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Packages;

