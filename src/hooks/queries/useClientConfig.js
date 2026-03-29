import { useQuery } from "@tanstack/react-query";
import { fetchClientConfig } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useClientConfig(clientId) {
  return useQuery({
    queryKey: queryKeys.clients.config(clientId),
    queryFn: () => fetchClientConfig(clientId),
    enabled: !!clientId,
    staleTime: FIVE_MINUTES,
  });
}
