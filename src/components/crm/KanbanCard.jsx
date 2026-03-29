import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { BantDots } from "./BantDots";
import { TierBadge } from "./TierBadge";
import { formatRelativeTime } from "@/utils/formatters";

/**
 * Compute days since stage_updated_at for color coding.
 * @param {string | null | undefined} stageUpdatedAt
 * @returns {number}
 */
function daysSinceStageUpdate(stageUpdatedAt) {
  if (!stageUpdatedAt) return 0;
  const diff = Date.now() - new Date(stageUpdatedAt).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

/**
 * Enriched draggable Kanban card with BANT dots, tier badge, origin, time-in-stage.
 * @param {{ lead: object, onSelect: (id: string) => void, highlighted: boolean }} props
 */
export function KanbanCard({ lead, onSelect, highlighted = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { type: "Card", lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const days = daysSinceStageUpdate(lead.stage_updated_at);
  const timeLabel = lead.stage_updated_at
    ? formatRelativeTime(lead.stage_updated_at)
    : "---";

  const timeColor =
    days > 14
      ? "text-red-400"
      : days > 7
        ? "text-amber-400"
        : "text-slate-500";

  const origin = lead.origem || lead.source || "Desconhecido";

  function handleClick() {
    if (!isDragging && onSelect) {
      onSelect(lead.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        "cursor-pointer rounded-lg border border-white/10 bg-sidebar-bg/50 p-3 shadow-md backdrop-blur-sm transition-all hover:bg-white/5",
        isDragging && "ring-2 ring-sky/50",
        highlighted && "border-blue-500 ring-1 ring-blue-500/40"
      )}
    >
      {/* Row 1: Name + Tier */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-slate-200 line-clamp-1">
          {lead.nome}
        </h4>
        <TierBadge tier={lead.lead_tier} />
      </div>

      {/* Row 2: Business or phone */}
      <p className="mt-1 text-xs text-slate-400 line-clamp-1">
        {lead.nome_negocio || lead.telefone}
      </p>

      {/* Row 3: BANT dots + origin + time-in-stage */}
      <div className="mt-3 flex items-center justify-between">
        <BantDots lead={lead} />
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <span>{origin}</span>
          <span className="text-slate-600">&middot;</span>
          <span className={timeColor}>{timeLabel}</span>
        </span>
      </div>
    </div>
  );
}
