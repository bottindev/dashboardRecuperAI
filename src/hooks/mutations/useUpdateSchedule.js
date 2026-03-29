import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateScheduleDay } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

export function useUpdateSchedule() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, config_cliente_id, ...updates }) =>
      updateScheduleDay(id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.clients.schedule(variables.config_cliente_id),
      });
    },
  });
}
