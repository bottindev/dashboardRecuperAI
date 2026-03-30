import { Skeleton } from "@/components/ui/skeleton";

const HEADER_WIDTHS = ["w-[18%]", "w-[12%]", "w-[12%]", "w-[10%]", "w-[14%]", "w-[10%]"];
const ROW_COUNT = 8;

export function ClientsTableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Table header */}
      <div className="flex gap-4 border-b border-border px-4 py-3">
        {HEADER_WIDTHS.map((w, i) => (
          <Skeleton key={i} className={`h-3.5 ${w}`} />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: ROW_COUNT }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 border-b border-border/30 px-4 py-3.5"
        >
          {/* Avatar + name */}
          <div className="flex w-[18%] items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-full max-w-[120px]" />
          </div>
          {/* Status badge */}
          <Skeleton className="h-5 w-[12%] rounded-full" />
          {/* MRR */}
          <Skeleton className="h-3.5 w-[12%]" />
          {/* Conversations */}
          <Skeleton className="h-3.5 w-[10%]" />
          {/* Health */}
          <Skeleton className="h-3.5 w-[14%]" />
          {/* Actions */}
          <Skeleton className="h-7 w-[10%] rounded-md" />
        </div>
      ))}
    </div>
  );
}
