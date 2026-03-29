import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Zap } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatters";

/**
 * Icon selection by interaction direction.
 * @param {"inbound" | "outbound"} direcao
 */
function DirectionIcon({ direcao }) {
  if (direcao === "inbound") {
    return <ArrowDownLeft className="h-4 w-4 text-blue-400" />;
  }
  return <ArrowUpRight className="h-4 w-4 text-emerald-400" />;
}

/**
 * Timeline of lead interactions, ordered newest first.
 * @param {{ interactions: Array }} props
 */
export function LeadTimeline({ interactions }) {
  if (!interactions || interactions.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        Nenhuma interacao registrada
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {interactions.map((item) => (
        <div key={item.id} className="flex gap-3">
          {/* Icon */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
            <DirectionIcon direcao={item.direcao} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">
              {item.mensagem}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {formatRelativeTime(item.created_at)}
              </span>
              {item.bant_signals_extracted != null && (
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Zap className="h-3 w-3" />
                  BANT
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
