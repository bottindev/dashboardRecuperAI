import { useQuery } from "@tanstack/react-query";
import { fetchClientsFull } from "@/services/supabaseService";
import { validateClients } from "@/services/dataValidation";
import { queryKeys } from "../queryKeys";

export function useClientsAdmin() {
  return useQuery({
    queryKey: queryKeys.clients.list(),
    queryFn: async () => {
      const raw = await fetchClientsFull();
      return validateClients(raw);
    },
  });
}
