import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { RefreshCw, ChevronRight, Bot, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { filterByPeriod, computeTotals, computeChartData } from "@/utils/metricsComputation";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { PeriodSelector } from "@/components/shared/PeriodSelector";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueAreaChart } from "@/components/dashboard/RevenueAreaChart";
import { RevenueBarChart } from "@/components/dashboard/RevenueBarChart";
import { ConversionPieChart } from "@/components/dashboard/ConversionPieChart";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { RoiSummary } from "@/components/dashboard/RoiSummary";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { fmtInt } from "@/utils/formatters";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function ClientDetailPage() {
  const { id } = useParams();
  const { clients, metrics, loading, error, reload } = useDashboardData();
  const [period, setPeriod] = useState("all");

  useAutoRefresh(reload, REFRESH_INTERVAL_MS);

  const client = useMemo(
    () => clients.find((c) => c.id === id),
    [clients, id]
  );

  const clientMetrics = useMemo(
    () => metrics.filter((m) => m.client_id === id),
    [metrics, id]
  );

  const periodMonths = period === "all" ? null : Number(period);
  const filtered = useMemo(
    () => filterByPeriod(clientMetrics, periodMonths),
    [clientMetrics, periodMonths]
  );

  const totals = useMemo(() => computeTotals(filtered), [filtered]);
  const chartData = useMemo(() => computeChartData(filtered), [filtered]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-foreground">Cliente nao encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">O cliente com este ID nao existe.</p>
        <Link to="/clientes" className="mt-4 text-sm text-primary hover:underline">
          Voltar para Clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/clientes" className="hover:text-foreground transition-colors">
            Clientes
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{client.name}</span>
          {client.status && (
            <Badge
              variant="secondary"
              className={
                client.status === "ativo"
                  ? "ml-2 bg-emerald/10 text-emerald text-[10px]"
                  : "ml-2 bg-amber/10 text-amber text-[10px]"
              }
            >
              {client.status}
            </Badge>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Atualizar
          </Button>
          <Badge variant="outline" className="border-emerald/30 text-emerald">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
            Ao vivo
          </Badge>
        </div>
      </div>

      {/* KPI Cards (6 standard) */}
      <KpiGrid totals={totals} chartData={chartData} />

      {/* Extra KPIs: Bot % + Tempo Economizado */}
      {(totals.botPercentage > 0 || totals.tempoEconomizado > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {totals.botPercentage > 0 && (
            <KpiCard
              title="Bot Autonomo"
              icon={Bot}
              color="violet"
              value={fmtInt(totals.botPercentage)}
              suffix="%"
              subtitle="Atendimentos resolvidos pelo bot"
              style={{ animation: "fadeInUp 0.4s ease both", animationDelay: "360ms" }}
            />
          )}
          {totals.tempoEconomizado > 0 && (
            <KpiCard
              title="Tempo Economizado"
              icon={Clock}
              color="amber"
              value={fmtInt(totals.tempoEconomizado)}
              suffix="min"
              subtitle="Economia via automacao"
              style={{ animation: "fadeInUp 0.4s ease both", animationDelay: "420ms" }}
            />
          )}
        </div>
      )}

      {/* Charts Row 1 */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RevenueAreaChart data={chartData} />
          <RevenueBarChart data={chartData} />
        </div>
      )}

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConversionPieChart totals={totals} />
        <ConversionFunnel totals={totals} />
      </div>

      {/* ROI Summary */}
      <RoiSummary totals={totals} />

      {/* Performance Table */}
      <PerformanceTable metrics={filtered} clients={clients} />
    </div>
  );
}
