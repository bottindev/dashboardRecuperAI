import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./KanbanCard";

/**
 * Kanban column with header counter and droppable context.
 * @param {{ column: { id: string, title: string, color: string }, leads: object[], onSelectLead: (id: string) => void, highlightedLeadId: string | null }} props
 */
export function KanbanColumn({ column, leads, onSelectLead, highlightedLeadId }) {
  const { setNodeRef: setSortableRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${column.id}`,
    data: { type: "Column", column },
  });

  return (
    <div className="flex flex-col gap-2 w-80 shrink-0">
      {/* Header with count */}
      <div
        className={cn(
          "flex items-center justify-between rounded-t-lg border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-card-foreground",
          column.color
        )}
      >
        <div className="flex items-center gap-2">
          <span>{column.title}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-normal">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={(node) => {
          setSortableRef(node);
          setDroppableRef(node);
        }}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-b-lg border border-border bg-muted/30 p-2 min-h-[500px] transition-colors",
          isOver && "bg-muted/50 border-primary/30"
        )}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground opacity-60">
              Nenhum lead neste estagio
            </p>
          ) : (
            leads.map((lead) => (
              <KanbanCard
                key={lead.id}
                lead={lead}
                onSelect={onSelectLead}
                highlighted={lead.id === highlightedLeadId}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
