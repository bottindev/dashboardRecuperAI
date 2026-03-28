import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClient } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

export function useUpdateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }) => updateClient(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all() });
    },
  });
}
