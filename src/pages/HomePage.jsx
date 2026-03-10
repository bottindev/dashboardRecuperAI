import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { CompanyKpiGrid } from "@/components/home/CompanyKpiGrid";
import { CompanyTrendChart } from "@/components/home/CompanyTrendChart";
import { ClientOverviewCard } from "@/components/home/ClientOverviewCard";
import { QuickActions } from "@/components/shared/QuickActions";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function HomePage() {
  const {
    companyKpis,
    clientSummaries,
    trendData,
    loading,
    error,
    reload,
  } = useCompanyData();

  useAutoRefresh(reload, REFRESH_INTERVAL_MS);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Visao Geral
          </h2>
          <p className="text-sm text-muted-foreground">
            Metricas agregadas de todos os clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Company KPIs */}
      <CompanyKpiGrid kpis={companyKpis} />

      {/* Trend Chart */}
      {trendData.length > 0 && <CompanyTrendChart data={trendData} />}

      {/* Client Cards Grid */}
      {clientSummaries.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">
            Clientes
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clientSummaries.map((client) => (
              <ClientOverviewCard key={client.id} client={client} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
