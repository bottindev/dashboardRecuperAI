import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-3 h-6 w-full" />
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4"
          >
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4">
          <Skeleton className="h-4 w-52" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-border/5 px-4 py-4"
          >
            <Skeleton className="h-3.5 w-[15%]" />
            <Skeleton className="h-3.5 w-[10%]" />
            <Skeleton className="h-3.5 w-[10%]" />
            <Skeleton className="h-3.5 w-[10%]" />
            <Skeleton className="h-3.5 w-[12%]" />
            <Skeleton className="h-3.5 w-[12%]" />
            <Skeleton className="h-3.5 w-[10%]" />
          </div>
        ))}
      </div>
    </div>
  );
}
