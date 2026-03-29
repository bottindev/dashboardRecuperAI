import { useQuery } from "@tanstack/react-query";
import {
  fetchClientConfig,
  fetchClientMetricsDetail,
} from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

async function fetchOverviewData(clientId) {
  const [client, metrics] = await Promise.all([
    fetchClientConfig(clientId),
    fetchClientMetricsDetail(clientId),
  ]);
  return { client, metrics };
}

export function useClientOverview(clientId) {
  const query = useQuery({
    queryKey: queryKeys.clients.overview(clientId),
    queryFn: () => fetchOverviewData(clientId),
    enabled: !!clientId,
    staleTime: FIVE_MINUTES,
  });

  return {
    ...query,
    client: query.data?.client ?? null,
    metrics: query.data?.metrics ?? [],
  };
}
