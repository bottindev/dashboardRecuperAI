import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useClientMetrics } from "@/hooks/queries/useClientMetrics";
import { computeTotals, computeChartData } from "@/utils/metricsComputation";
import { RevenueAreaChart } from "@/components/dashboard/RevenueAreaChart";
import { RevenueBarChart } from "@/components/dashboard/RevenueBarChart";
import { ConversionPieChart } from "@/components/dashboard/ConversionPieChart";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { RoiSummary } from "@/components/dashboard/RoiSummary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );
}

export function TabMetrics({ clientId }) {
  const { data: metrics, isPending } = useClientMetrics(clientId);

  const totals = useMemo(
    () => (metrics && metrics.length > 0 ? computeTotals(metrics) : null),
    [metrics]
  );

  const chartData = useMemo(
    () => (metrics && metrics.length > 0 ? computeChartData(metrics) : []),
    [metrics]
  );

  if (isPending) return <MetricsSkeleton />;

  if (!metrics || metrics.length === 0) {
    return <EmptyState icon={BarChart3} message="Nenhuma metrica disponivel." />;
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Revenue charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RevenueAreaChart data={chartData} />
          <RevenueBarChart data={chartData} />
        </div>
      )}

      {/* Row 2: Conversion charts */}
      {totals && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ConversionPieChart totals={totals} />
          <ConversionFunnel totals={totals} />
        </div>
      )}

      {/* Row 3: ROI Summary */}
      {totals && <RoiSummary totals={totals} />}
    </div>
  );
}
