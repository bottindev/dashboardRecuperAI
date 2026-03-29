import { useQuery } from "@tanstack/react-query";
import { fetchClientServices } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useClientServices(clientId) {
  return useQuery({
    queryKey: queryKeys.clients.services(clientId),
    queryFn: () => fetchClientServices(clientId),
    enabled: !!clientId,
    staleTime: FIVE_MINUTES,
  });
}
