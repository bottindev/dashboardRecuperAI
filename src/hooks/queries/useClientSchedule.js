import { useQuery } from "@tanstack/react-query";
import { fetchClientSchedule } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useClientSchedule(clientId) {
  return useQuery({
    queryKey: queryKeys.clients.schedule(clientId),
    queryFn: () => fetchClientSchedule(clientId),
    enabled: !!clientId,
    staleTime: FIVE_MINUTES,
  });
}
