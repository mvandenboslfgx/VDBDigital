"use client";

type BarChartProps = {
  title: string;
  data: { label: string; value: number }[];
  valueFormat?: (n: number) => string;
};

export function BarChart({ title, data, valueFormat = (n) => String(n) }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</h4>
      <div className="mt-4 flex items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-gray-500">{valueFormat(d.value)}</span>
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${(d.value / max) * 120}px`,
                minHeight: d.value > 0 ? "8px" : "0",
                background: `linear-gradient(to top, rgba(198,169,93,0.4), rgba(198,169,93,0.8))`,
              }}
            />
            <span className="text-[10px] text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
