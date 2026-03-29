import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { queryKeys } from "../queryKeys";

const THIRTY_SECONDS = 30 * 1000;

async function fetchLeadInteractions(leadId) {
  const { data, error } = await supabase
    .from("recuperai_lead_interacoes")
    .select("id, direcao, mensagem, bant_signals_extracted, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export function useLeadInteractions(leadId) {
  return useQuery({
    queryKey: queryKeys.pipeline.interactions(leadId),
    queryFn: () => fetchLeadInteractions(leadId),
    enabled: !!leadId,
    staleTime: THIRTY_SECONDS,
  });
}
