import Link from "next/link";

export default function FinalCta() {
  return (
    <section id="cta" className="py-32 relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(198,169,93,0.16),transparent_55%)]" />
      <div className="section-container">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#151515] via-black to-black px-6 py-16 sm:px-10 sm:py-20 text-center shadow-[0_28px_70px_rgba(0,0,0,0.95)]">
          <p className="section-heading">Get started</p>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold font-serif text-white">
            Create a free account. Run your first audit. Upgrade when you need more.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-300/90 max-w-xl mx-auto">
            Create a free account to access the dashboard: website audits, AI tools and calculators.
            Run your first audit in seconds, then upgrade to Pro or Agency for more.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary">
              Start Free Account
            </Link>
            <Link href="/pricing" className="btn-ghost text-sm">
              View pricing
            </Link>
            <Link href="/contact" className="btn-ghost text-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

