import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Check, Loader2 } from "lucide-react";
import { useClientSchedule } from "@/hooks/queries/useClientSchedule";
import { useUpdateSchedule } from "@/hooks/mutations/useUpdateSchedule";

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
];

function ScheduleRow({ row, clientId }) {
  const [localRow, setLocalRow] = useState(() => structuredClone(row));
  const [dirty, setDirty] = useState(false);
  const updateSchedule = useUpdateSchedule();

  const dayName = DAY_NAMES[row.dia_semana] ?? `Dia ${row.dia_semana}`;
  const isClosed = !localRow.hora_abertura && !localRow.hora_fechamento;

  const handleChange = (field, value) => {
    setLocalRow((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleClosedToggle = (checked) => {
    if (checked) {
      // Mark as closed
      setLocalRow((prev) => ({
        ...prev,
        hora_abertura: null,
        hora_fechamento: null,
      }));
    } else {
      // Restore defaults
      setLocalRow((prev) => ({
        ...prev,
        hora_abertura: "09:00",
        hora_fechamento: "18:00",
      }));
    }
    setDirty(true);
  };

  const handleSave = () => {
    updateSchedule.mutate(
      {
        id: localRow.id,
        config_cliente_id: clientId,
        hora_abertura: localRow.hora_abertura,
        hora_fechamento: localRow.hora_fechamento,
      },
      {
        onSuccess: () => {
          toast.success(`Horario de ${dayName} salvo`);
          setDirty(false);
        },
        onError: (err) => {
          toast.error(err?.message ?? "Erro ao salvar horario");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-20 text-sm font-medium shrink-0">{dayName}</span>

      <div className="flex items-center gap-2">
        <Switch
          checked={isClosed}
          onCheckedChange={handleClosedToggle}
          size="sm"
        />
        <span className="text-xs text-muted-foreground w-16">
          {isClosed ? "Fechado" : "Aberto"}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-1">
        <Input
          type="time"
          value={localRow.hora_abertura ?? ""}
          onChange={(e) => handleChange("hora_abertura", e.target.value || null)}
          disabled={isClosed}
          className="w-28"
        />
        <span className="text-xs text-muted-foreground">ate</span>
        <Input
          type="time"
          value={localRow.hora_fechamento ?? ""}
          onChange={(e) =>
            handleChange("hora_fechamento", e.target.value || null)
          }
          disabled={isClosed}
          className="w-28"
        />
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleSave}
        disabled={!dirty || updateSchedule.isPending}
        className="shrink-0"
      >
        {updateSchedule.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export function ConfigSchedule({ clientId }) {
  const { data: schedule, isPending } = useClientSchedule(clientId);

  if (isPending) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!schedule?.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Nenhum horario cadastrado.
      </p>
    );
  }

  // Sort by dia_semana so days display in order
  const sorted = [...schedule].sort((a, b) => a.dia_semana - b.dia_semana);

  return (
    <div className="space-y-2">
      {sorted.map((row) => (
        <ScheduleRow key={row.id} row={row} clientId={clientId} />
      ))}
    </div>
  );
}
