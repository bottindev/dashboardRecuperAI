import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Calendar, Flame, Coffee, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePipelineData } from "@/hooks/queries/usePipelineData";
import { useMovePipelineLead } from "@/hooks/mutations/useMovePipelineLead";

// --- Configuração das Colunas ---
// TODO Phase 2+: Follow Up badge/tag on lead cards (not a column)
const COLUMNS = [
  { id: "novo", title: "Lead", color: "bg-slate-800" },
  { id: "call_agendada", title: "Call Agendada", color: "bg-blue-950" },
  { id: "proposta", title: "Proposta", color: "bg-amber-950" },
  { id: "onboarding", title: "Onboarding", color: "bg-emerald-950" },
  { id: "ativo", title: "Ativo", color: "bg-green-950" },
];

function getScoreColor(score) {
  if (!score) return "text-slate-400 bg-slate-800";
  if (score >= 70) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
  if (score >= 40) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  return "text-red-500 bg-red-500/10 border-red-500/20";
}

// --- Componente: Card Sortable ---
function SortableKanbanCard({ lead }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing rounded-lg border border-white/10 bg-sidebar-bg/50 p-3 shadow-md backdrop-blur-sm transition-colors hover:bg-white/5",
        isDragging && "ring-2 ring-sky/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-slate-200">{lead.nome}</h4>
          <p className="text-xs text-slate-400 line-clamp-1">{lead.nome_negocio || lead.telefone}</p>
        </div>
        <div className={cn("flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-bold", getScoreColor(lead.bant_total_score))}>
          {lead.bant_total_score || 0}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          {lead.lead_tier === 'hot' && <Flame className="h-3 w-3 text-orange-500" />}
          {lead.lead_tier === 'warm' && <Coffee className="h-3 w-3 text-yellow-500" />}
          {lead.lead_tier === 'cold' && <UserX className="h-3 w-3 text-red-500" />}
          {lead.lead_tier || 'novo'}
        </span>
        {lead.call_agendada_at && (
          <span className="flex items-center gap-1 text-emerald-400">
            <Calendar className="h-3 w-3" />
            Agenda
          </span>
        )}
      </div>
    </div>
  );
}

// --- Componente: Coluna ---
function KanbanColumn({ column, leads }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  return (
    <div className="flex flex-col gap-2 w-80 shrink-0">
      <div className={cn("flex items-center justify-between rounded-t-lg border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-slate-200", column.color)}>
        <div className="flex items-center gap-2">
          <span>{column.title}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs font-normal">
            {leads.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 rounded-b-lg border border-white/5 bg-black/20 p-2 min-h-[500px]"
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <SortableKanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// --- Principal: Board ---
export function CrmKanban() {
  const { data: leads = [], isPending } = usePipelineData();
  const moveLead = useMovePipelineLead();

  const [activeLead, setActiveLead] = useState(null);

  // Sensores do DnD Kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle Drag Events
  function handleDragStart(event) {
    if (event.active.data.current?.type === "Card") {
      setActiveLead(event.active.data.current.lead);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeLeadData = active.data.current?.lead;
    const overType = over.data.current?.type;

    if (!activeLeadData) return;

    let targetColumnId = activeLeadData.etapa;

    if (overType === "Column") {
      targetColumnId = overId;
    } else if (overType === "Card") {
      const overLead = over.data.current?.lead;
      if (overLead) {
         targetColumnId = overLead.etapa;
      }
    }

    if (activeLeadData.etapa !== targetColumnId) {
      moveLead.mutate(
        { leadId: activeLeadData.id, newEtapa: targetColumnId },
        {
          onError: () => {
            toast.error("Erro ao mover lead. Revise se ja aplicou a migration.");
          },
        }
      );
    }
    setActiveLead(null);
  }

  if (isPending && leads.length === 0) {
    return <div className="animate-pulse text-slate-400">Carregando CRM...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full w-full gap-4 overflow-x-auto pb-4 pt-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            leads={leads.filter((l) => l.etapa === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? <SortableKanbanCard lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
