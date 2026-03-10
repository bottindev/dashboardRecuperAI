import { useState } from "react";
import { RefreshCw, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { callRpc, triggerReport } from "@/services/supabaseService";

const ACTIONS = [
  {
    id: "recompute",
    icon: RefreshCw,
    label: "Recomputar Metricas",
    description: "Recalcular todas as metricas mensais",
    action: () => callRpc("compute_monthly_metrics"),
    successMsg: "Metricas recomputadas com sucesso!",
  },
  {
    id: "report",
    icon: FileText,
    label: "Enviar Relatorio",
    description: "Disparar relatorio mensal agora",
    action: () => triggerReport(null),
    successMsg: "Relatorio enviado com sucesso!",
  },
  {
    id: "test",
    icon: MessageCircle,
    label: "Conversa Teste",
    description: "Enviar mensagem de teste via WhatsApp",
    action: async () => {
      // Placeholder - would call Evolution API
      await new Promise((r) => setTimeout(r, 1000));
      return { ok: true };
    },
    successMsg: "Mensagem de teste enviada!",
  },
];

export function QuickActions() {
  const [loadingId, setLoadingId] = useState(null);

  const handleAction = async (act) => {
    if (loadingId) return;
    setLoadingId(act.id);
    try {
      await act.action();
      toast.success(act.successMsg);
    } catch (e) {
      toast.error(`Erro: ${e.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Acoes Rapidas
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ACTIONS.map((act) => {
          const Icon = act.icon;
          const isLoading = loadingId === act.id;
          return (
            <Button
              key={act.id}
              variant="outline"
              className="h-auto flex-col gap-1.5 py-4 text-left"
              disabled={!!loadingId}
              onClick={() => handleAction(act)}
            >
              <Icon
                className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">{act.label}</span>
              <span className="text-[11px] text-muted-foreground">
                {act.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
