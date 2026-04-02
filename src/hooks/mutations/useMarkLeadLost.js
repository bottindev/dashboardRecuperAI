import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseHQ as supabase } from "@/lib/supabaseHQ";
import { queryKeys } from "../queryKeys";

export const LOST_REASONS = [
  "Nao respondeu",
  "Preco",
  "Concorrencia",
  "Sem interesse",
  "Outro",
];

async function markLeadLost({ leadId, reason }) {
  // Move pipeline entry to cancelado with reason
  const { error: pipeErr } = await supabase
    .from("recuperai_pipeline")
    .update({
      etapa: "cancelado",
      notas: reason,
      atualizado_em: new Date().toISOString(),
    })
    .eq("lead_id", leadId);

  if (pipeErr) throw pipeErr;

  // Log the interaction for timeline
  const { error: interErr } = await supabase
    .from("recuperai_lead_interacoes")
    .insert({
      lead_id: leadId,
      direcao: "outbound",
      mensagem: `Lead marcado como perdido. Motivo: ${reason}`,
    });

  if (interErr) throw interErr;
}

export function useMarkLeadLost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markLeadLost,

    onSettled: () => {
      // Lead disappears from Kanban after being marked lost
      queryClient.invalidateQueries({
        queryKey: queryKeys.pipeline.leads(),
      });
    },
  });
}
