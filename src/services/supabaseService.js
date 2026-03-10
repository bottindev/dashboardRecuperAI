const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const DEFAULT_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function supaFetch(table, query = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, { headers: DEFAULT_HEADERS });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Supabase error ${res.status} em "${table}": ${body || res.statusText}`
    );
  }

  return res.json();
}

async function supaMutate(method, table, query = "", body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Supabase ${method} error ${res.status} em "${table}": ${text || res.statusText}`
    );
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchClients() {
  return supaFetch("recuperai_clients", "select=*&order=name");
}

export async function fetchMetrics() {
  return supaFetch("recuperai_monthly_metrics", "select=*&order=month.desc");
}

export async function fetchClientsFull() {
  return supaFetch("config_clientes", "select=id,nome_negocio,status,investimento_mensal,whatsapp_relatorio&order=nome_negocio");
}

export async function createClient(data) {
  return supaMutate("POST", "config_clientes", "", data);
}

export async function updateClient(id, data) {
  return supaMutate("PATCH", "config_clientes", `id=eq.${id}`, data);
}

export async function callRpc(name, body = {}) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${name}`;
  const res = await fetch(url, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RPC ${name} error ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function triggerReport(clientId) {
  const url = `${SUPABASE_URL}/functions/v1/generate-monthly-report`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...DEFAULT_HEADERS,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ client_id: clientId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Report trigger error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
