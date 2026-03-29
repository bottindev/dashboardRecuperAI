import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const BANT_FIELDS = [
  { key: "bant_budget_score", label: "Budget", letter: "B" },
  { key: "bant_authority_score", label: "Authority", letter: "A" },
  { key: "bant_need_score", label: "Need", letter: "N" },
  { key: "bant_timeline_score", label: "Timeline", letter: "T" },
];

/**
 * Renders 4 dots (B A N T) — filled if score > 0, empty otherwise.
 * @param {{ lead: object }} props
 */
export function BantDots({ lead }) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {BANT_FIELDS.map(({ key, label, letter }) => {
          const filled = (lead[key] ?? 0) > 0;
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold select-none",
                    filled
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-700 text-slate-500"
                  )}
                >
                  {letter}
                </span>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
