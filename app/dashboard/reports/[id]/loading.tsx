import Skeleton from "@/components/ui/Skeleton";

export default function ReportLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-5 w-40" />
      <div className="flex flex-wrap justify-between gap-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-panel">
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-16 w-48 rounded-lg" />
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#111113] p-6 shadow-panel">
            <Skeleton className="h-4 w-48" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
