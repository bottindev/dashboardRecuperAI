import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createClosedDate,
  deleteClosedDate,
} from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

export function useCreateClosedDate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => createClosedDate(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.clients.closedDates(variables.config_cliente_id),
      });
    },
  });
}

export function useDeleteClosedDate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => deleteClosedDate(id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.clients.closedDates(variables.config_cliente_id),
      });
    },
  });
}
