import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClientPerformance } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const TWO_MINUTES = 2 * 60 * 1000;

export function useClientPerformance() {
  const query = useQuery({
    queryKey: queryKeys.clientPerformance.list(),
    queryFn: fetchClientPerformance,
    staleTime: TWO_MINUTES,
    refetchInterval: TWO_MINUTES,
  });

  const clients = useMemo(() => query.data ?? [], [query.data]);

  return { ...query, clients };
}
