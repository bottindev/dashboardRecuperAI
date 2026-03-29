import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useClientClosedDates } from "@/hooks/queries/useClientClosedDates";
import {
  useCreateClosedDate,
  useDeleteClosedDate,
} from "@/hooks/mutations/useManageClosedDates";

const EMPTY_FORM = { data_inicio: "", data_fim: "", motivo: "" };

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

export function ConfigClosedDates({ clientId }) {
  const { data: closedDates, isPending } = useClientClosedDates(clientId);
  const createClosedDate = useCreateClosedDate();
  const deleteClosedDate = useDeleteClosedDate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    if (!form.data_inicio) {
      toast.error("Data de inicio e obrigatoria");
      return;
    }

    createClosedDate.mutate(
      {
        config_cliente_id: clientId,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        motivo: form.motivo.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Data fechada adicionada");
          setForm({ ...EMPTY_FORM });
          setShowForm(false);
        },
        onError: (err) => {
          toast.error(err?.message ?? "Erro ao adicionar data fechada");
        },
      }
    );
  };

  const handleDelete = (row) => {
    deleteClosedDate.mutate(
      { id: row.id, config_cliente_id: clientId },
      {
        onSuccess: () => {
          toast.success("Data fechada removida");
        },
        onError: (err) => {
          toast.error(err?.message ?? "Erro ao remover data fechada");
        },
      }
    );
  };

  if (isPending) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Add button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="cd-inicio">Data Inicio *</Label>
              <Input
                id="cd-inicio"
                type="date"
                value={form.data_inicio}
                onChange={(e) => handleFormChange("data_inicio", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd-fim">Data Fim</Label>
              <Input
                id="cd-fim"
                type="date"
                value={form.data_fim}
                onChange={(e) => handleFormChange("data_fim", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd-motivo">Motivo</Label>
              <Input
                id="cd-motivo"
                value={form.motivo}
                onChange={(e) => handleFormChange("motivo", e.target.value)}
                placeholder="Ex: Ferias, Feriado"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setForm({ ...EMPTY_FORM });
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!form.data_inicio || createClosedDate.isPending}
            >
              {createClosedDate.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Adicionar
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {!closedDates?.length ? (
        <p className="text-sm text-muted-foreground py-4">
          Nenhuma data fechada cadastrada.
        </p>
      ) : (
        <div className="space-y-2">
          {closedDates.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">
                  {formatDate(row.data_inicio)}
                </span>
                {row.data_fim && row.data_fim !== row.data_inicio && (
                  <>
                    <span className="text-muted-foreground">ate</span>
                    <span className="font-medium">
                      {formatDate(row.data_fim)}
                    </span>
                  </>
                )}
                {row.motivo && (
                  <span className="text-muted-foreground">
                    — {row.motivo}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(row)}
                disabled={deleteClosedDate.isPending}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
