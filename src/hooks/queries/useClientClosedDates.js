import { useQuery } from "@tanstack/react-query";
import { fetchClientClosedDates } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useClientClosedDates(clientId) {
  return useQuery({
    queryKey: queryKeys.clients.closedDates(clientId),
    queryFn: () => fetchClientClosedDates(clientId),
    enabled: !!clientId,
    staleTime: FIVE_MINUTES,
  });
}
