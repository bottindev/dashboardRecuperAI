import { useState, useCallback } from "react";
import { fetchClients, fetchMetrics } from "../services/supabaseService";
import { validateClients, validateMetrics } from "../services/dataValidation";

export function useDashboardData() {
  const [clients, setClients] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [rawClients, rawMetrics] = await Promise.all([
        fetchClients(),
        fetchMetrics(),
      ]);

      setClients(validateClients(rawClients));
      setMetrics(validateMetrics(rawMetrics));
    } catch (e) {
      console.error("[useDashboardData]", e);
      setError(e.message || "Erro desconhecido ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { clients, metrics, loading, error, reload: load };
}
