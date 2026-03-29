import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateService } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

export function useUpdateService() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, config_cliente_id, ...updates }) =>
      updateService(id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.clients.services(variables.config_cliente_id),
      });
    },
  });
}
