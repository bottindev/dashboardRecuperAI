import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/shared/ErrorState";
import { usePipelineData } from "@/hooks/queries/usePipelineData";
import { useMovePipelineLead } from "@/hooks/mutations/useMovePipelineLead";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanScrollContainer } from "./KanbanScrollContainer";
import { LeadDetailSheet } from "./LeadDetailSheet";

// --- Column configuration ---
const COLUMNS = [
  { id: "novo", title: "Lead", color: "bg-slate-800" },
  { id: "call_agendada", title: "Call Agendada", color: "bg-blue-950" },
  { id: "proposta", title: "Proposta", color: "bg-amber-950" },
  { id: "onboarding", title: "Onboarding", color: "bg-emerald-950" },
  { id: "ativo", title: "Ativo", color: "bg-green-950" },
];

const TIER_OPTIONS = ["hot", "warm", "cold"];

export function CrmKanban() {
  const { data: leads = [], isPending, isError, refetch } = usePipelineData();
  const moveLead = useMovePipelineLead();

  const [activeLead, setActiveLead] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [highlightedLeadId, setHighlightedLeadId] = useState(null);
  const highlightTimerRef = useRef(null);

  // Filters
  const [tierFilter, setTierFilter] = useState(null);
  const [origemFilter, setOrigemFilter] = useState(null);

  // Derive unique origins from data
  const uniqueOrigens = useMemo(() => {
    const origins = new Set();
    for (const lead of leads) {
      const val = lead.origem || lead.source;
      if (val) origins.add(val);
    }
    return Array.from(origins).sort();
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (tierFilter) {
      result = result.filter((l) => l.lead_tier === tierFilter);
    }
    if (origemFilter) {
      result = result.filter(
        (l) => (l.origem || l.source) === origemFilter
      );
    }
    return result;
  }, [leads, tierFilter, origemFilter]);

  const hasActiveFilters = tierFilter != null || origemFilter != null;

  // Card selection with post-close highlight
  const handleSelectLead = useCallback((leadId) => {
    setSelectedLeadId(leadId);
  }, []);

  // When Sheet closes, briefly highlight the card (for Plan 03 wiring)
  const handleCloseSheet = useCallback(() => {
    const prevId = selectedLeadId;
    setSelectedLeadId(null);
    if (prevId) {
      setHighlightedLeadId(prevId);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedLeadId(null);
      }, 2000);
    }
  }, [selectedLeadId]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event) {
    if (event.active.data.current?.type === "Card") {
      setActiveLead(event.active.data.current.lead);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      setActiveLead(null);
      return;
    }

    const activeLeadData = active.data.current?.lead;
    const overType = over.data.current?.type;
    if (!activeLeadData) {
      setActiveLead(null);
      return;
    }

    let targetColumnId = activeLeadData.etapa;

    if (overType === "Column") {
      targetColumnId = over.data.current?.column?.id ?? over.id;
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
            toast.error(
              "Erro ao mover lead. Revise se ja aplicou a migration."
            );
          },
        }
      );
    }
    setActiveLead(null);
  }

  if (isPending && leads.length === 0) {
    return (
      <div className="animate-pulse text-slate-400">Carregando CRM...</div>
    );
  }

  if (isError) {
    return <ErrorState message="Erro ao carregar dados." onRetry={refetch} />;
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />

        {/* Tier filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5",
              tierFilter && "border-white/25 bg-white/5"
            )}
          >
            {tierFilter
              ? tierFilter.charAt(0).toUpperCase() + tierFilter.slice(1)
              : "Tier"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filtrar por tier</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTierFilter(null)}>
              Todos
            </DropdownMenuItem>
            {TIER_OPTIONS.map((t) => (
              <DropdownMenuItem key={t} onClick={() => setTierFilter(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Origin filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5",
              origemFilter && "border-white/25 bg-white/5"
            )}
          >
            {origemFilter || "Origem"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filtrar por origem</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOrigemFilter(null)}>
              Todas
            </DropdownMenuItem>
            {uniqueOrigens.map((o) => (
              <DropdownMenuItem key={o} onClick={() => setOrigemFilter(o)}>
                {o}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setTierFilter(null);
              setOrigemFilter(null);
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-400 transition-colors hover:text-slate-200"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <KanbanScrollContainer>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              leads={filteredLeads.filter((l) => l.etapa === col.id)}
              onSelectLead={handleSelectLead}
              highlightedLeadId={highlightedLeadId}
            />
          ))}
        </KanbanScrollContainer>

        <DragOverlay>
          {activeLead ? <KanbanCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      <LeadDetailSheet
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onClose={handleCloseSheet}
      />
    </div>
  );
}
