import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCeoOverview } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const TWO_MINUTES = 2 * 60 * 1000;

const EMPTY_OVERVIEW = {
  mrr: 0,
  total_clientes_ativos: 0,
  leads_pipeline: 0,
  total_conversas_global: 0,
  total_convertidos_global: 0,
};

export function useCeoOverview() {
  const query = useQuery({
    queryKey: queryKeys.ceo.overview(),
    queryFn: fetchCeoOverview,
    staleTime: TWO_MINUTES,
    refetchInterval: TWO_MINUTES,
  });

  const overview = useMemo(
    () => query.data ?? EMPTY_OVERVIEW,
    [query.data]
  );

  return { ...query, overview };
}
