import { useQuery } from "@tanstack/react-query";
import { fetchClientMetricsDetail } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useClientMetrics(clientId) {
  return useQuery({
    queryKey: queryKeys.clients.metricsDetail(clientId),
    queryFn: () => fetchClientMetricsDetail(clientId),
    enabled: !!clientId,
    staleTime: FIVE_MINUTES,
  });
}
