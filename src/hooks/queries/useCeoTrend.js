import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCeoTrend } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useCeoTrend() {
  const query = useQuery({
    queryKey: queryKeys.ceo.trend(),
    queryFn: fetchCeoTrend,
    staleTime: FIVE_MINUTES,
    refetchInterval: FIVE_MINUTES,
  });

  const trendData = useMemo(() => query.data ?? [], [query.data]);

  return { ...query, trendData };
}
