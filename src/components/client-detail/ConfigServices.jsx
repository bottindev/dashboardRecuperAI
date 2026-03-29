import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Loader2, Save } from "lucide-react";
import { useClientServices } from "@/hooks/queries/useClientServices";
import { useUpdateService } from "@/hooks/mutations/useUpdateService";

function ServiceRow({ service, clientId }) {
  const [expanded, setExpanded] = useState(false);
  const [editState, setEditState] = useState(null);
  const updateService = useUpdateService();

  const handleExpand = () => {
    if (!expanded) {
      // Isolate from cache via structuredClone
      setEditState(structuredClone(service));
    }
    setExpanded((prev) => !prev);
  };

  const handleChange = (field, value) => {
    setEditState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editState) return;
    updateService.mutate(
      {
        id: editState.id,
        config_cliente_id: clientId,
        nome_servico: editState.nome_servico,
        preco: editState.preco != null ? Number(editState.preco) : null,
        duracao_minutos:
          editState.duracao_minutos != null
            ? Number(editState.duracao_minutos)
            : null,
        descricao: editState.descricao,
      },
      {
        onSuccess: () => {
          toast.success("Servico salvo com sucesso");
          setExpanded(false);
        },
        onError: (err) => {
          toast.error(err?.message ?? "Erro ao salvar servico");
        },
      }
    );
  };

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={handleExpand}
        className="flex w-full items-center justify-between gap-4 p-3 text-left text-sm hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-medium truncate">
            {service.nome_servico ?? "Sem nome"}
          </span>
          <span className="text-muted-foreground shrink-0">
            {service.preco != null ? `R$ ${Number(service.preco).toFixed(2)}` : "—"}
          </span>
          <span className="text-muted-foreground shrink-0">
            {service.duracao_minutos != null
              ? `${service.duracao_minutos} min`
              : "—"}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && editState && (
        <div className="border-t p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`svc-nome-${service.id}`}>Nome do Servico</Label>
              <Input
                id={`svc-nome-${service.id}`}
                value={editState.nome_servico ?? ""}
                onChange={(e) => handleChange("nome_servico", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`svc-preco-${service.id}`}>Preco (R$)</Label>
              <Input
                id={`svc-preco-${service.id}`}
                type="number"
                step="0.01"
                min="0"
                value={editState.preco ?? ""}
                onChange={(e) =>
                  handleChange(
                    "preco",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`svc-duracao-${service.id}`}>Duracao (min)</Label>
              <Input
                id={`svc-duracao-${service.id}`}
                type="number"
                min="0"
                value={editState.duracao_minutos ?? ""}
                onChange={(e) =>
                  handleChange(
                    "duracao_minutos",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`svc-desc-${service.id}`}>Descricao</Label>
            <textarea
              id={`svc-desc-${service.id}`}
              rows={2}
              value={editState.descricao ?? ""}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateService.isPending}
            >
              {updateService.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Salvar Servico
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConfigServices({ clientId }) {
  const { data: services, isPending } = useClientServices(clientId);

  if (isPending) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!services?.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Nenhum servico cadastrado.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <ServiceRow
          key={service.id}
          service={service}
          clientId={clientId}
        />
      ))}
    </div>
  );
}
