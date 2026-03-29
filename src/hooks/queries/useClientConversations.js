import { useQuery } from "@tanstack/react-query";
import { fetchClientConversations } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const TWO_MINUTES = 2 * 60 * 1000;

export function useClientConversations(clientId) {
  return useQuery({
    queryKey: queryKeys.clients.conversations(clientId),
    queryFn: () => fetchClientConversations(clientId),
    enabled: !!clientId,
    staleTime: TWO_MINUTES,
  });
}
