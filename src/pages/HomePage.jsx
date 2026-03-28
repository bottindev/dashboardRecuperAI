import { useCeoOverview } from "@/hooks/queries/useCeoOverview";
import { useCeoTrend } from "@/hooks/queries/useCeoTrend";
import { useClientPerformance } from "@/hooks/queries/useClientPerformance";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { CeoHeader } from "@/components/home/CeoHeader";
import { CompanyKpiGrid } from "@/components/home/CompanyKpiGrid";
import { CompanyTrendChart } from "@/components/home/CompanyTrendChart";
import { ClientOverviewCard } from "@/components/home/ClientOverviewCard";

export default function HomePage() {
  const {
    overview,
    dataUpdatedAt,
    isPending: kpiPending,
    isError: kpiError,
    error: kpiErr,
    refetch: refetchKpi,
    isRefetching: kpiRefetching,
  } = useCeoOverview();

  const {
    trendData,
    isPending: trendPending,
    isError: trendError,
    error: trendErr,
  } = useCeoTrend();

  const {
    clients,
    isPending: clientsPending,
    isError: clientsError,
    error: clientsErr,
  } = useClientPerformance();

  if (kpiPending && trendPending && clientsPending) {
    return <LoadingSkeleton />;
  }

  const firstError = kpiError
    ? kpiErr
    : trendError
      ? trendErr
      : clientsError
        ? clientsErr
        : null;

  if (firstError) {
    return <ErrorState message={firstError?.message} onRetry={refetchKpi} />;
  }

  return (
    <div className="space-y-6">
      <CeoHeader
        dataUpdatedAt={dataUpdatedAt}
        onRefresh={() => refetchKpi()}
        isRefetching={kpiRefetching}
      />

      <CompanyKpiGrid overview={overview} trendData={trendData} />

      {trendData.length > 0 && <CompanyTrendChart data={trendData} />}

      {clients.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-foreground">
            Clientes
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <ClientOverviewCard
                key={client.config_cliente_id}
                client={client}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
