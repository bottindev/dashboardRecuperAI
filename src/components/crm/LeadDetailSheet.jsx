import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  ExternalLink,
  ChevronDown,
  Send,
  XCircle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useLeadDetail } from "@/hooks/queries/useLeadDetail";
import { useLeadInteractions } from "@/hooks/queries/useLeadInteractions";
import { useUpdateLead } from "@/hooks/mutations/useUpdateLead";
import { useAddLeadNote } from "@/hooks/mutations/useAddLeadNote";
import { useMovePipelineLead } from "@/hooks/mutations/useMovePipelineLead";
import { useMarkLeadLost } from "@/hooks/mutations/useMarkLeadLost";

import { BantDots } from "./BantDots";
import { TierBadge } from "./TierBadge";
import { LeadTimeline } from "./LeadTimeline";
import { LostReasonDialog } from "./LostReasonDialog";

// Column options for stage move
const STAGE_OPTIONS = [
  { id: "novo", label: "Lead" },
  { id: "call_agendada", label: "Call Agendada" },
  { id: "proposta", label: "Proposta" },
  { id: "onboarding", label: "Onboarding" },
  { id: "ativo", label: "Ativo" },
];

// Editable fields configuration
const EDITABLE_FIELDS = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "telefone", label: "Telefone" },
  { key: "nome_negocio", label: "Negocio" },
];

/**
 * Inline-editable field: click to edit, blur or Enter to save.
 */
function EditableField({ label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  function startEditing() {
    setDraft(value ?? "");
    setEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    if (trimmed !== (value ?? "")) {
      onSave(trimmed);
    }
    setEditing(false);
  }

  function cancel() {
    setDraft(value ?? "");
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      cancel();
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          autoFocus
          className="h-7 text-sm"
        />
        <button type="button" onClick={save} className="text-emerald-400">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={cancel} className="text-muted-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 hover:bg-muted"
      onClick={startEditing}
    >
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="flex-1 text-sm text-foreground">
        {value || <span className="italic text-muted-foreground/60">vazio</span>}
      </span>
      <Pencil className="h-3 w-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

/**
 * Loading skeleton for the Sheet content.
 */
function SheetSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Separator />
      <Skeleton className="h-40 w-full" />
      <Separator />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}

/**
 * Sheet slide-over with 4 sections: header, timeline, editable fields, quick actions.
 * @param {{ leadId: string | null, open: boolean, onClose: () => void }} props
 */
export function LeadDetailSheet({ leadId, open, onClose }) {
  const { data: lead, isPending: leadPending } = useLeadDetail(leadId);
  const { data: interactions = [], isPending: interactionsPending } =
    useLeadInteractions(leadId);

  const updateLead = useUpdateLead();
  const addNote = useAddLeadNote();
  const moveLead = useMovePipelineLead();
  const markLost = useMarkLeadLost();

  const [noteText, setNoteText] = useState("");
  const [showLostReason, setShowLostReason] = useState(false);

  const handleOpenChange = useCallback(
    (isOpen) => {
      if (!isOpen) {
        setNoteText("");
        setShowLostReason(false);
        onClose();
      }
    },
    [onClose]
  );

  function handleFieldSave(field, value) {
    if (!leadId) return;
    updateLead.mutate(
      { leadId, updates: { [field]: value } },
      {
        onError: () => toast.error(`Erro ao salvar ${field}`),
      }
    );
  }

  function handleAddNote() {
    const trimmed = noteText.trim();
    if (!trimmed || !leadId) return;
    addNote.mutate(
      { leadId, mensagem: trimmed },
      {
        onSuccess: () => {
          setNoteText("");
        },
        onError: () => toast.error("Erro ao adicionar nota"),
      }
    );
  }

  function handleNoteKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddNote();
    }
  }

  function handleMoveStage(newEtapa) {
    if (!leadId) return;
    moveLead.mutate(
      { leadId, newEtapa },
      {
        onError: () => toast.error("Erro ao mover lead"),
      }
    );
  }

  function handleMarkLost(reason) {
    if (!leadId) return;
    markLost.mutate(
      { leadId, reason },
      {
        onSuccess: () => {
          setShowLostReason(false);
          onClose();
        },
        onError: () => toast.error("Erro ao marcar lead como perdido"),
      }
    );
  }

  // Determine current stage label for display
  const currentStageLabel =
    STAGE_OPTIONS.find((s) => s.id === lead?.etapa)?.label ?? lead?.etapa;

  // Filter out current stage from move options
  const moveOptions = lead
    ? STAGE_OPTIONS.filter((s) => s.id !== lead.etapa)
    : STAGE_OPTIONS;

  // Build WhatsApp URL
  const whatsappUrl = lead?.telefone
    ? `https://wa.me/${lead.telefone.replace(/\D/g, "")}`
    : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-[550px] sm:max-w-[550px] overflow-y-auto"
      >
        {leadPending ? (
          <SheetSkeleton />
        ) : lead ? (
          <>
            {/* ===== Section 1: Header ===== */}
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold text-foreground">
                {lead.nome}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Detalhes do lead {lead.nome}
              </SheetDescription>

              {/* Phone */}
              {lead.telefone && (
                <a
                  href={`tel:${lead.telefone}`}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-slate-200"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {lead.telefone}
                </a>
              )}

              {/* Origin */}
              <p className="text-xs text-muted-foreground">
                {lead.origem || lead.source || "Desconhecido"}
              </p>

              {/* Badges row: Tier + BANT + Stage pill */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TierBadge tier={lead.lead_tier} />
                <BantDots lead={lead} />
                {currentStageLabel && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {currentStageLabel}
                  </span>
                )}
              </div>
            </SheetHeader>

            <Separator />

            {/* ===== Section 2: Timeline + Add Note ===== */}
            <div className="px-4">
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Timeline
              </h3>

              {/* Add note */}
              <div className="mb-3 flex gap-2">
                <Textarea
                  placeholder="Adicionar nota... (Ctrl+Enter para enviar)"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={handleNoteKeyDown}
                  className="min-h-10 text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || addNote.isPending}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Interactions list */}
              <ScrollArea className="max-h-[300px]">
                {interactionsPending ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <LeadTimeline interactions={interactions} />
                )}
              </ScrollArea>
            </div>

            <Separator />

            {/* ===== Section 3: Editable Fields ===== */}
            <div className="flex flex-col gap-1 px-4">
              <h3 className="mb-1 text-sm font-medium text-foreground">
                Dados do Lead
              </h3>
              {EDITABLE_FIELDS.map(({ key, label }) => (
                <EditableField
                  key={key}
                  label={label}
                  value={lead[key]}
                  onSave={(val) => handleFieldSave(key, val)}
                />
              ))}
            </div>

            <Separator />

            {/* ===== Section 4: Quick Actions ===== */}
            <div className="flex flex-col gap-2 px-4 pb-4">
              <h3 className="mb-1 text-sm font-medium text-foreground">
                Acoes
              </h3>

              <div className="flex flex-wrap gap-2">
                {/* Move stage */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Mover de stage
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {moveOptions.map((stage) => (
                      <DropdownMenuItem
                        key={stage.id}
                        onClick={() => handleMoveStage(stage.id)}
                      >
                        {stage.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* WhatsApp */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!whatsappUrl}
                  onClick={() => whatsappUrl && window.open(whatsappUrl, "_blank")}
                >
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Abrir WhatsApp
                </Button>

                {/* Mark lost */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowLostReason((prev) => !prev)}
                  disabled={markLost.isPending}
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Marcar perdido
                </Button>
              </div>

              {/* Lost reason inline picker */}
              <LostReasonDialog
                open={showLostReason}
                onConfirm={handleMarkLost}
                onCancel={() => setShowLostReason(false)}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Lead nao encontrado
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
