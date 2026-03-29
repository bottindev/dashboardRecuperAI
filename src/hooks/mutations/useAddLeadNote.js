import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { queryKeys } from "../queryKeys";

async function addLeadNote({ leadId, mensagem }) {
  const { data, error } = await supabase
    .from("recuperai_lead_interacoes")
    .insert({
      lead_id: leadId,
      direcao: "outbound",
      mensagem,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useAddLeadNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLeadNote,

    onSettled: (_data, _error, { leadId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pipeline.interactions(leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pipeline.leads(),
      });
    },
  });
}
