import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClients, fetchMetrics } from "@/services/supabaseService";
import { validateClients, validateMetrics } from "@/services/dataValidation";
import {
  computeCompanyKpis,
  computeClientSummary,
  computeCompanyTrend,
} from "@/utils/companyMetrics";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

async function fetchOverviewData() {
  const [rawClients, rawMetrics] = await Promise.all([
    fetchClients(),
    fetchMetrics(),
  ]);

  const clients = validateClients(rawClients);
  const metrics = validateMetrics(rawMetrics);

  const companyKpis = computeCompanyKpis(clients, metrics);
  const clientSummaries = clients.map((c) => computeClientSummary(c, metrics));
  const trendData = computeCompanyTrend(metrics);

  return { companyKpis, clientSummaries, trendData };
}

export function useOverviewData() {
  const query = useQuery({
    queryKey: queryKeys.overview.data(),
    queryFn: fetchOverviewData,
    staleTime: FIVE_MINUTES,
    refetchInterval: FIVE_MINUTES,
  });

  // Provide stable empty defaults when data is undefined
  const { companyKpis, clientSummaries, trendData } = useMemo(
    () => query.data ?? { companyKpis: null, clientSummaries: [], trendData: [] },
    [query.data]
  );

  return {
    ...query,
    companyKpis,
    clientSummaries,
    trendData,
  };
}
