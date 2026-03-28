import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClients, fetchMetrics } from "@/services/supabaseService";
import { validateClients, validateMetrics } from "@/services/dataValidation";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

async function fetchClientDetailData(clientId) {
  const [rawClients, rawMetrics] = await Promise.all([
    fetchClients(),
    fetchMetrics(),
  ]);

  const clients = validateClients(rawClients);
  const metrics = validateMetrics(rawMetrics);

  const client = clients.find((c) => c.id === clientId) ?? null;
  const clientMetrics = metrics.filter((m) => m.client_id === clientId);

  return { client, clientMetrics, allClients: clients };
}

export function useClientDetailData(clientId) {
  const query = useQuery({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: () => fetchClientDetailData(clientId),
    enabled: !!clientId,
    staleTime: FIVE_MINUTES,
  });

  const { client, clientMetrics, allClients } = useMemo(
    () => query.data ?? { client: null, clientMetrics: [], allClients: [] },
    [query.data]
  );

  return {
    ...query,
    client,
    clientMetrics,
    allClients,
  };
}
