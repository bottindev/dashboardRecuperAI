import { useMemo } from "react";
import { useDashboardData } from "./useDashboardData";
import {
  computeCompanyKpis,
  computeClientSummary,
  computeCompanyTrend,
} from "@/utils/companyMetrics";

export function useCompanyData() {
  const { clients, metrics, loading, error, reload } = useDashboardData();

  const companyKpis = useMemo(
    () => computeCompanyKpis(clients, metrics),
    [clients, metrics]
  );

  const clientSummaries = useMemo(
    () => clients.map((c) => computeClientSummary(c, metrics)),
    [clients, metrics]
  );

  const trendData = useMemo(
    () => computeCompanyTrend(metrics),
    [metrics]
  );

  return {
    clients,
    metrics,
    companyKpis,
    clientSummaries,
    trendData,
    loading,
    error,
    reload,
  };
}
