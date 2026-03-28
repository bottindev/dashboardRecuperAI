import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatters";

export function CeoHeader({ dataUpdatedAt, onRefresh, isRefetching }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const relativeTime = dataUpdatedAt
    ? formatRelativeTime(new Date(dataUpdatedAt))
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">Visao Geral</h2>
        {relativeTime && (
          <span className="text-sm text-muted-foreground">
            {" \u2014 "}Atualizado {relativeTime}
          </span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefetching}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        aria-label="Atualizar dados"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}
