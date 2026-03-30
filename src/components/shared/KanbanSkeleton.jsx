import { Skeleton } from "@/components/ui/skeleton";

const COLUMN_COUNT = 5;
const CARDS_PER_COLUMN = [3, 2, 2, 3, 2];

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: COLUMN_COUNT }).map((_, colIdx) => (
        <div key={colIdx} className="flex w-80 shrink-0 flex-col gap-2">
          {/* Column header */}
          <div className="flex items-center justify-between rounded-t-lg bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>

          {/* Card skeletons */}
          <div className="flex flex-1 flex-col gap-2 rounded-b-lg border border-border bg-muted/20 p-2 min-h-[500px]">
            {Array.from({ length: CARDS_PER_COLUMN[colIdx] }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="rounded-lg border border-border bg-card p-3"
              >
                {/* Name + badge */}
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                {/* Business line */}
                <Skeleton className="mt-2 h-3 w-24" />
                {/* BANT + origin + time */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, d) => (
                      <Skeleton key={d} className="h-3 w-3 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
