"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SiteStructure } from "../types";

export function AiBuilderClientSection() {
  const [businessType, setBusinessType] = useState("");
  const [city, setCity] = useState("");
  const [style, setStyle] = useState("Luxe, minimalistisch");
  const [services, setServices] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structure, setStructure] = useState<SiteStructure | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          city,
          style,
          services: services
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(
          data?.message ??
            "Kon geen AI-layout genereren. Probeer het later opnieuw."
        );
      }

      const data = (await res.json()) as { structure: SiteStructure };
      setStructure(data.structure);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Onverwachte fout tijdens het genereren van de layout."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(198,169,93,0.22),transparent_55%)]" />
      <div className="section-container grid gap-10 lg:grid-cols-[0.9fr,1.1fr] items-start">
        <div className="rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7 shadow-[0_26px_80px_rgba(0,0,0,0.95)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            AI Layout Generator
          </p>
          <h2 className="mt-3 text-lg font-semibold text-white">
            Genereer een volledige sitestructuur.
          </h2>
          <p className="mt-2 text-xs text-gray-300">
            Beschrijf het type bedrijf, regio en kernservices. Je ontvangt een
            voorstel voor home, diensten, over en contact.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 text-xs text-gray-200"
          >
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-gray-300">
                Type bedrijf
              </label>
              <input
                className="input-base"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Bijv. AI agency, installatiebedrijf, advocatenkantoor"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-gray-300">
                  Stad / regio
                </label>
                <input
                  className="input-base"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bijv. Rotterdam, Randstad"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-gray-300">
                  Stijl
                </label>
                <input
                  className="input-base"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-gray-300">
                Kernservices (comma-separated)
              </label>
              <textarea
                className="input-base min-h-[72px]"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Bijv. AI-audits, automatisering, funnels, merkwebsites"
              />
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <motion.button
              type="submit"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="btn-primary mt-3 w-full"
            >
              {isSubmitting
                ? "Layout wordt gegenereerd..."
                : "Genereer AI-sitestructuur"}
            </motion.button>
          </form>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7 text-xs text-gray-200 shadow-[0_26px_80px_rgba(0,0,0,0.95)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            Structuur preview
          </p>
          {!structure ? (
            <p className="mt-3 text-gray-300">
              Na het versturen verschijnt hier een overzicht van de voorgestelde
              pagina&apos;s en secties. Ideale basis voor wireframes, sitemap of
              briefing.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {(["home", "services", "about", "contact"] as const).map(
                (key) => {
                  const page = structure[key];
                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-white/10 bg-black/70 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                        {page.title}
                      </p>
                      {page.headline && (
                        <p className="mt-2 text-sm font-semibold text-white">
                          {page.headline}
                        </p>
                      )}
                      {page.text && (
                        <p className="mt-1 text-[11px] text-gray-300">
                          {page.text}
                        </p>
                      )}
                      <ul className="mt-3 space-y-1.5">
                        {page.sections.map((section) => (
                          <li
                            key={section.id}
                            className="flex gap-2 text-[11px]"
                          >
                            <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-gold/80" />
                            <span>
                              <span className="font-semibold text-gray-100">
                                {section.title}
                              </span>
                              {": "}
                              <span className="text-gray-300">
                                {section.description}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                      {page.cta && (
                        <p className="mt-3 text-[11px] text-gold font-medium">
                          CTA: {page.cta}
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AiBuilderClientSection;

