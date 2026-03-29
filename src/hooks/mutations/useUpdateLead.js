import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { queryKeys } from "../queryKeys";

async function updateLead({ leadId, updates }) {
  const { data, error } = await supabase
    .from("recuperai_leads")
    .update(updates)
    .eq("id", leadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLead,

    onSettled: (_data, _error, { leadId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pipeline.detail(leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pipeline.leads(),
      });
    },
  });
}
