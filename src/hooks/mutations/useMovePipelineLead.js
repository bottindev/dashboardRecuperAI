import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { queryKeys } from "../queryKeys";

async function movePipelineLead({ leadId, newEtapa }) {
  const { error } = await supabase
    .from("recuperai_pipeline")
    .update({ etapa: newEtapa, atualizado_em: new Date().toISOString() })
    .eq("lead_id", leadId);

  if (error) throw error;
}

export function useMovePipelineLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: movePipelineLead,

    onMutate: async ({ leadId, newEtapa }) => {
      // Cancel in-flight queries so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.pipeline.leads(),
      });

      // Snapshot current data for rollback
      const previous = queryClient.getQueryData(queryKeys.pipeline.leads());

      // Optimistically update the lead's etapa in cache
      queryClient.setQueryData(queryKeys.pipeline.leads(), (old) => {
        if (!old) return old;
        return old.map((lead) =>
          lead.id === leadId ? { ...lead, etapa: newEtapa } : lead
        );
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      // Rollback to previous data on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.pipeline.leads(), context.previous);
      }
    },

    onSettled: () => {
      // Refetch to ensure cache matches server state
      queryClient.invalidateQueries({
        queryKey: queryKeys.pipeline.leads(),
      });
    },
  });
}
