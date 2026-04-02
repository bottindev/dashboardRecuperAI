import { useQuery } from "@tanstack/react-query";
import { supabaseHQ as supabase } from "@/lib/supabaseHQ";
import { queryKeys } from "../queryKeys";

const THIRTY_SECONDS = 30 * 1000;

async function fetchLeadDetail(leadId) {
  const { data, error } = await supabase
    .from("recuperai_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error) throw error;
  return data;
}

export function useLeadDetail(leadId) {
  return useQuery({
    queryKey: queryKeys.pipeline.detail(leadId),
    queryFn: () => fetchLeadDetail(leadId),
    enabled: !!leadId,
    staleTime: THIRTY_SECONDS,
  });
}
