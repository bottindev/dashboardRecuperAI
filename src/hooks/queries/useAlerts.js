import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "@/services/supabaseService";
import { queryKeys } from "../queryKeys";

const ONE_MINUTE = 60 * 1000;

export function useAlerts() {
  const query = useQuery({
    queryKey: queryKeys.alerts.recent(),
    queryFn: fetchAlerts,
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
  });

  const alerts = useMemo(() => query.data ?? [], [query.data]);
  const alertCount = alerts.length;

  return { ...query, alerts, alertCount };
}
