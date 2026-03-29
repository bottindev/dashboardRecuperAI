import { Link } from "react-router-dom";
import { ChevronRight, RefreshCw, Pencil, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { computeHealth, HEALTH_CONFIG } from "@/utils/healthBadge";
import { fmt } from "@/utils/formatters";

const CONTRACT_BADGE_CLASSES = {
  ativo: "border-emerald-500/30 text-emerald-600",
  trial: "border-amber-500/30 text-amber-600",
  inadimplente: "border-red-500/30 text-red-600",
  cancelado: "border-red-500/30 text-red-600",
  inativo: "border-muted-foreground/30 text-muted-foreground",
};

/**
 * Map client config + monthly metrics (VIEW column names) to the shape
 * computeHealth expects (ClientOverviewCard field names).
 */
function computeClientDetailHealth(client, metrics) {
  if (!client) {
    return { status: "red", reason: "Sem dados" };
  }
  if (!metrics || metrics.length === 0) {
    return { status: "red", reason: "Sem dados" };
  }
  const latest = metrics[metrics.length - 1];
  return computeHealth({
    contrato_status: client.status,
    total_conversas: latest.total_conversations ?? 0,
    receita_gerada_bot: latest.total_recovered_value ?? 0,
    taxa_conversao: latest.conversion_rate ?? 0,
    valor_mensalidade: client.investimento_mensal ?? 0,
  });
}

export function ClientHeader({ client, metrics, onEditClick, onRefresh }) {
  const health = computeClientDetailHealth(client, metrics);
  const cfg = HEALTH_CONFIG[health.status];

  const contractClass =
    CONTRACT_BADGE_CLASSES[client?.status] ||
    "border-muted-foreground/30 text-muted-foreground";

  const clientName = client?.nome_negocio || client?.name || "—";

  return (
    <div className="px-6 pt-4 pb-2 space-y-2">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/clientes" className="hover:text-foreground transition-colors">
          Clientes
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{clientName}</span>
      </nav>

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: name + badges */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {clientName}
          </h1>

          {client?.status && (
            <Badge variant="outline" className={`text-[10px] shrink-0 ${contractClass}`}>
              {client.status}
            </Badge>
          )}

          <span
            className={`flex items-center gap-1 text-[10px] font-medium shrink-0 ${cfg.textClass}`}
            title={health.reason}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
          </span>

          {client?.cidade && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <MapPin className="h-3 w-3" />
              {client.cidade}
            </span>
          )}

          {client?.investimento_mensal > 0 && (
            <span className="hidden md:inline text-xs text-muted-foreground shrink-0">
              R$ {fmt(client.investimento_mensal)}/mes
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
}
