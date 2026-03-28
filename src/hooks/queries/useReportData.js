import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClients, fetchMetrics } from "@/services/supabaseService";
import { validateClients, validateMetrics } from "@/services/dataValidation";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

async function fetchReportData() {
  const [rawClients, rawMetrics] = await Promise.all([
    fetchClients(),
    fetchMetrics(),
  ]);

  const clients = validateClients(rawClients);
  const metrics = validateMetrics(rawMetrics);

  return { clients, metrics };
}

export function useReportData() {
  const query = useQuery({
    queryKey: queryKeys.reports.data(),
    queryFn: fetchReportData,
    staleTime: FIVE_MINUTES,
  });

  const { clients, metrics } = useMemo(
    () => query.data ?? { clients: [], metrics: [] },
    [query.data]
  );

  return {
    ...query,
    clients,
    metrics,
  };
}
