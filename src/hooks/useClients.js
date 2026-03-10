import { useState, useCallback } from "react";
import { fetchClientsFull, createClient, updateClient } from "@/services/supabaseService";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClientsFull();
      setClients(data);
    } catch (e) {
      console.error("[useClients]", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    const created = await createClient(data);
    setClients((prev) => [...prev, created].sort((a, b) =>
      (a.nome_negocio || "").localeCompare(b.nome_negocio || "")
    ));
    return created;
  }, []);

  const update = useCallback(async (id, data) => {
    const updated = await updateClient(id, data);
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    return updated;
  }, []);

  const deactivate = useCallback(async (id) => {
    const updated = await updateClient(id, { status: "inativo" });
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "inativo" } : c))
    );
    return updated;
  }, []);

  return { clients, loading, error, reload: load, create, update, deactivate };
}
