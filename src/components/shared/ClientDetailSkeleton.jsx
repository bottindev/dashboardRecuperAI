import { Skeleton } from "@/components/ui/skeleton";

export function ClientDetailSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header area */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-4 flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
