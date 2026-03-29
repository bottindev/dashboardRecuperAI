import { useState } from "react";
import { cn } from "@/lib/utils";
import { LOST_REASONS } from "@/hooks/mutations/useMarkLeadLost";
import { Button } from "@/components/ui/button";

/**
 * Inline collapsible reason picker for marking a lead as lost.
 * Avoids nested Dialog/Sheet z-index issues by rendering inline.
 *
 * @param {{ open: boolean, onConfirm: (reason: string) => void, onCancel: () => void }} props
 */
export function LostReasonDialog({ open, onConfirm, onCancel }) {
  const [selectedReason, setSelectedReason] = useState(null);

  if (!open) return null;

  function handleConfirm() {
    if (!selectedReason) return;
    onConfirm(selectedReason);
    setSelectedReason(null);
  }

  function handleCancel() {
    setSelectedReason(null);
    onCancel();
  }

  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
      <p className="mb-2 text-sm font-medium text-red-400">
        Selecione o motivo
      </p>

      <div className="flex flex-col gap-1">
        {LOST_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => setSelectedReason(reason)}
            className={cn(
              "rounded-md px-3 py-1.5 text-left text-sm transition-colors",
              selectedReason === reason
                ? "bg-red-500/20 text-red-300"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-300"
            )}
          >
            {reason}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={!selectedReason}
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
