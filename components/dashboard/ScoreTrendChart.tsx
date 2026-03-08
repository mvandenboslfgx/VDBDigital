"use client";

interface ScoreTrendChartProps {
  scores: number[];
  labels: string[];
}

/** Simple score trend: horizontal bars or line indication. */
export function ScoreTrendChart({ scores, labels }: ScoreTrendChartProps) {
  if (scores.length === 0) return null;
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500">Score-trend</p>
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {scores.slice(0, 14).reverse().map((score, i) => (
          <div
            key={i}
            className="flex-1 min-w-[8px] rounded-t bg-amber-500/30 hover:bg-amber-500/50 transition-colors"
            style={{
              height: `${Math.max(8, ((score - min) / (max - min || 1)) * 100)}%`,
            }}
            title={`${labels[labels.length - 1 - i] ?? ""}: ${score}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{labels[labels.length - 1] ?? ""}</span>
        <span>{labels[0] ?? ""}</span>
      </div>
    </div>
  );
}
