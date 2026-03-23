export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-zinc-800" />
      <div className="h-4 w-96 max-w-full rounded bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-zinc-900/80" />
        ))}
      </div>
      <div className="h-[280px] rounded-2xl bg-zinc-900/80" />
    </div>
  );
}
