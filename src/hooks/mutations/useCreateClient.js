import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

export function useCreateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (clientData) => createClient(clientData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all() });
    },
  });
}
