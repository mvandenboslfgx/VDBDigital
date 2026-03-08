"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";
import ScoreRing from "@/components/ui/ScoreRing";

const mockScores = [
  { label: "SEO", value: 78 },
  { label: "Perf", value: 92 },
  { label: "UX", value: 65 },
  { label: "Conv", value: 71 },
];

export default function DashboardPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="section-container">
        <p className="section-heading">Control room</p>
        <h2 className="section-title mt-2">
          Jouw dashboard. Jouw scores. Eén plek.
        </h2>
        <p className="text-sub mt-4 max-w-2xl">
          Voer scans uit, bekijk je historie en lees AI-rapporten. Alles om je site te verbeteren in één overzicht.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-white/[0.06] bg-[#111113] p-8 md:p-12 shadow-elevated overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/[0.06] pb-8">
            <div>
              <p className="text-label text-zinc-500">Website-score</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                voorbeeld.nl
              </p>
            </div>
            <div className="flex gap-8 md:gap-12">
              {mockScores.map((s) => (
                <ScoreRing
                  key={s.label}
                  score={s.value}
                  label={s.label}
                  size="sm"
                />
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Recente scans", "AI-adviezen", "Groeikansen"].map(
              (title, i) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <p className="text-sm font-medium text-zinc-400">{title}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Widgetvoorbeeld
                  </p>
                </div>
              )
            )}
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/create-account">
              <Button>Open je dashboard</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
