import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { fmt, fmtInt, formatRelativeTime } from "@/utils/formatters";

function computeHealth(c) {
  if (c.contrato_status === "cancelado") {
    return { status: "red", reason: "Contrato cancelado" };
  }
  if ((c.total_conversas || 0) === 0) {
    return { status: "red", reason: "Sem conversas" };
  }
  const roi =
    (c.receita_gerada_bot || 0) / Math.max(c.valor_mensalidade || 1, 1);
  if ((c.taxa_conversao || 0) < 10) {
    return {
      status: "yellow",
      reason: `Baixa conversao (${(c.taxa_conversao || 0).toFixed(1)}%)`,
    };
  }
  if (roi < 1) {
    return { status: "yellow", reason: `ROI abaixo de 1x (${roi.toFixed(1)}x)` };
  }
  return {
    status: "green",
    reason: `ROI ${roi.toFixed(1)}x | Conversao ${(c.taxa_conversao || 0).toFixed(1)}%`,
  };
}

const HEALTH_CONFIG = {
  green: {
    label: "Saudavel",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600",
  },
  yellow: {
    label: "Atencao",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600",
  },
  red: {
    label: "Critico",
    dotClass: "bg-red-500",
    textClass: "text-red-600",
  },
};

const CONTRACT_BADGE_CLASSES = {
  ativo: "border-emerald-500/30 text-emerald-600",
  trial: "border-amber-500/30 text-amber-600",
  inadimplente: "border-red-500/30 text-red-600",
};

export function ClientOverviewCard({ client }) {
  const navigate = useNavigate();
  const health = computeHealth(client);
  const cfg = HEALTH_CONFIG[health.status];

  const contractClass =
    CONTRACT_BADGE_CLASSES[client.contrato_status] ||
    "border-muted-foreground/30 text-muted-foreground";

  const clientId = client.config_cliente_id ?? client.id;

  return (
    <button
      onClick={() => navigate(`/clientes/${clientId}`)}
      className="group w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      {/* Name + Health badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {client.nome_negocio || client.name || "—"}
          </h3>
          <Badge
            variant="outline"
            className={`mt-1 text-[10px] ${contractClass}`}
          >
            {client.contrato_status || "—"}
          </Badge>
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] font-medium ${cfg.textClass}`}
          title={health.reason}
        >
          <span className={`inline-block h-2 w-2 rounded-full ${cfg.dotClass}`} />
          {cfg.label}
        </span>
      </div>

      {/* Sparkline */}
      {client.sparkline && client.sparkline.length > 1 && (
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={client.sparkline}>
              <defs>
                <linearGradient
                  id={`client-${clientId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#0EA5E9"
                strokeWidth={1.5}
                fill={`url(#client-${clientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Metrics row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <span className="block text-xs text-muted-foreground">
            Receita Bot
          </span>
          <span className="text-sm font-mono font-semibold text-foreground">
            R$ {fmt(client.receita_gerada_bot)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground">Conversas</span>
          <span className="text-sm font-mono font-semibold text-foreground">
            {fmtInt(client.total_conversas)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground">
            Ultima conversa
          </span>
          <span className="text-sm font-mono font-semibold text-foreground">
            {client.ultima_conversa
              ? formatRelativeTime(client.ultima_conversa)
              : "\u2014"}
          </span>
        </div>
      </div>
    </button>
  );
}
