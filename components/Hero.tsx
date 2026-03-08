"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export const Hero = () => {
  useEffect(() => {
    const key = "vdb_visit_tracked";
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-32 pb-32 lg:pt-40 lg:pb-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(198,169,93,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(0,0,0,0.9),transparent_60%)]" />
      <div className="section-container grid gap-16 lg:grid-cols-[3fr,2fr] items-center">
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="section-heading">VDB DIGITAL · LUXE WEBSTUDIO</p>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-[3.75rem] font-semibold tracking-tight font-serif">
              Wij bouwen digitale infrastructuur{" "}
              <span className="block bg-gradient-to-r from-gold via-[#F6E7B5] to-gold bg-clip-text text-transparent">
                die merken onvermijdelijk maakt.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-sm sm:text-base text-gray-300/90">
              Strategie, design, conversie en automatisering samengebracht in
              één kalme, maar meedogenloos effectieve webervaring. Gemaakt voor
              teams die merkwaarde meten in omzet, niet in pageviews.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <Link href="/contact" className="btn-primary">
              Start Your Project
            </Link>
            <Link href="/work" className="btn-ghost">
              View Case Studies
            </Link>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-6 text-xs text-gray-300/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-gold text-base">★</span>
              <div>
                <p className="text-gray-100 font-medium">5.0 klantbeoordeling</p>
                <p className="text-gray-400">Over alle trajecten heen</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <div>
                <p className="text-gray-100 font-medium">25+ projecten</p>
                <p className="text-gray-400">Gelanceerd voor ambitieuze teams</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <div>
                <p className="text-gray-100 font-medium">100% tevredenheid</p>
                <p className="text-gray-400">
                  We leveren totdat het resultaat onvermijdelijk voelt
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative hidden h-[380px] rounded-3xl border border-white/10 bg-gradient-to-br from-[#161616] via-black to-black/95 shadow-gold-glow lg:block overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.06),transparent_55%),radial-gradient(circle_at_100%_0,rgba(198,169,93,0.32),transparent_55%)]" />
          <div className="relative h-full p-6 flex flex-col justify-between">
            <div>
                <p className="text-xs font-semibold tracking-[0.28em] text-gray-400 uppercase">
                  Conversie-architectuur
                </p>
                <p className="mt-4 text-lg font-serif text-white">
                  Elke screen, scroll en micro-interactie is gechoreografeerd om
                  bezoekers dichter bij “ja” te brengen.
                </p>
            </div>
            <div className="space-y-3 text-xs text-gray-100">
              <div className="flex items-center justify-between rounded-2xl bg-black/50 px-4 py-3 border border-white/5">
                <span className="text-gray-400">Gemiddelde stijging in leads</span>
                <span className="font-semibold text-gold">+32%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-black/50 px-4 py-3 border border-white/5">
                <span className="text-gray-400">Tijd tot lancering</span>
                <span className="font-semibold text-gray-100">
                  4–6 weeks
                </span>
              </div>
                <p className="text-[11px] text-gray-500">
                  Cijfers gebaseerd op recente klantresultaten. Elk traject wordt
                  gemodelleerd op jouw markt, marges en schaalambitie.
                </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

