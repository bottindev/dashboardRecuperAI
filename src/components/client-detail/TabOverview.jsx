import { useMemo } from "react";
import { DollarSign, TrendingUp, Target, Receipt } from "lucide-react";
import { useClientOverview } from "@/hooks/queries/useClientOverview";
import { computeHealth, HEALTH_CONFIG } from "@/utils/healthBadge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { fmt, fmtPct } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Map client config + monthly metrics (VIEW column names) to the shape
 * computeHealth expects.
 */
function computeDetailHealth(client, metrics) {
  if (!client || !metrics || metrics.length === 0) {
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

function computeDelta(current, previous) {
  if (previous == null || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function TabOverview({ clientId }) {
  const { client, metrics, isPending } = useClientOverview(clientId);

  const health = useMemo(
    () => computeDetailHealth(client, metrics),
    [client, metrics]
  );

  const kpis = useMemo(() => {
    if (!metrics || metrics.length === 0) return null;

    const sorted = [...metrics].sort((a, b) =>
      (a.month || "").localeCompare(b.month || "")
    );
    const latest = sorted[sorted.length - 1];
    const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

    return [
      {
        title: "Receita do Bot",
        icon: DollarSign,
        color: "sky",
        value: fmt(latest.total_recovered_value),
        prefix: "R$",
        trend: computeDelta(
          latest.total_recovered_value,
          prev?.total_recovered_value
        ),
        subtitle: "Valor recuperado no mes",
        chartData: sorted.map((m) => ({ v: m.total_recovered_value ?? 0 })),
      },
      {
        title: "ROI",
        icon: TrendingUp,
        color: "emerald",
        value: fmtPct(latest.roi_percent),
        trend: computeDelta(latest.roi_percent, prev?.roi_percent),
        subtitle: "Retorno sobre investimento",
        chartData: sorted.map((m) => ({ v: m.roi_percent ?? 0 })),
      },
      {
        title: "Taxa de Conversao",
        icon: Target,
        color: "violet",
        value: fmtPct(latest.conversion_rate),
        trend: computeDelta(latest.conversion_rate, prev?.conversion_rate),
        subtitle: "Conversas convertidas",
        chartData: sorted.map((m) => ({ v: m.conversion_rate ?? 0 })),
      },
      {
        title: "Ticket Medio",
        icon: Receipt,
        color: "amber",
        value: fmt(latest.avg_ticket),
        prefix: "R$",
        trend: computeDelta(latest.avg_ticket, prev?.avg_ticket),
        subtitle: "Valor medio por conversao",
        chartData: sorted.map((m) => ({ v: m.avg_ticket ?? 0 })),
      },
    ];
  }, [metrics]);

  if (isPending) return <OverviewSkeleton />;

  const cfg = HEALTH_CONFIG[health.status];

  return (
    <div className="space-y-6">
      {/* Health banner */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <span className={`inline-block h-3 w-3 rounded-full ${cfg.dotClass}`} />
        <div>
          <span className={`text-sm font-semibold ${cfg.textClass}`}>
            {cfg.label}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            {health.reason}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      {kpis ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              icon={kpi.icon}
              color={kpi.color}
              value={kpi.value}
              prefix={kpi.prefix}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
              chartData={kpi.chartData}
              style={{
                animation: "fadeInUp 0.4s ease both",
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          Sem dados de metricas para este cliente.
        </div>
      )}
    </div>
  );
}
