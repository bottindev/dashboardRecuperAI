import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { queryKeys } from "../queryKeys";

const THIRTY_SECONDS = 30 * 1000;

const ACTIVE_ETAPAS = ["novo", "call_agendada", "proposta", "onboarding", "ativo"];

async function fetchPipelineLeads() {
  const { data, error } = await supabase
    .from("recuperai_pipeline")
    .select(
      `
      etapa,
      lead_id,
      recuperai_leads (
        id,
        nome,
        telefone,
        nome_negocio,
        bant_total_score,
        lead_tier,
        call_agendada_at
      )
    `
    )
    .in("etapa", ACTIVE_ETAPAS)
    .order("atualizado_em", { ascending: false });

  if (error) throw error;

  // Flatten the joined payload (same transform as original CrmKanban)
  return data
    .map((row) => ({
      ...row.recuperai_leads,
      etapa: row.etapa || "novo",
    }))
    .filter((l) => l.id);
}

export function usePipelineData() {
  const queryClient = useQueryClient();

  // Realtime subscription: invalidate cache on any pipeline change
  useEffect(() => {
    const channel = supabase
      .channel("pipeline-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recuperai_pipeline" },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.pipeline.leads(),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.pipeline.leads(),
    queryFn: fetchPipelineLeads,
    staleTime: THIRTY_SECONDS,
  });
}
