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

export async function fetchClients() {
  return supaFetch("recuperai_clients", "select=*&order=name");
}

export async function fetchMetrics() {
  return supaFetch("recuperai_monthly_metrics", "select=*&order=month.desc");
}
