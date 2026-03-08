import type React from "react";

type Props = {
  score: number;
};

export function SeoScoreWidget({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tier =
    clamped >= 80 ? "Strong" : clamped >= 60 ? "Solid" : "Needs attention";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        SEO SCORE
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-3xl font-semibold text-gold">{clamped}</p>
          <p className="mt-1 text-xs text-gray-300">{tier}</p>
        </div>
        <div className="relative h-14 w-14 rounded-full border border-gold/40 bg-black/60">
          <div
            className="absolute inset-1 rounded-full bg-[conic-gradient(from_210deg,_#D4B76A_var(--percent),_rgba(30,64,175,0.4)_var(--percent))]"
            style={{ "--percent": `${clamped}%` } as React.CSSProperties}
          />
          <div className="absolute inset-2 rounded-full bg-black/90" />
        </div>
      </div>
      <p className="mt-3 text-[11px] text-gray-400">
        Indicative score based on your current projects and review sentiment.
      </p>
    </div>
  );
}

export default SeoScoreWidget;

