import { supabase } from "@/lib/supabaseClient";
import { supabaseHQ } from "@/lib/supabaseHQ";

export async function fetchClients() {
  const { data, error } = await supabase
    .from("recuperai_clients")
    .select("*")
    .order("name");
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

export async function fetchMetrics() {
  const { data, error } = await supabase
    .from("recuperai_monthly_metrics")
    .select("*")
    .order("month", { ascending: false });
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

export async function fetchClientsFull() {
  const { data, error } = await supabase
    .from("config_clientes")
    .select("id,nome_negocio,status,investimento_mensal,whatsapp_relatorio")
    .order("nome_negocio");
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

export async function createClient(clientData) {
  const { data, error } = await supabase
    .from("config_clientes")
    .insert(clientData)
    .select()
    .single();
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from("config_clientes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

export async function callRpc(name, params = {}) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw new Error(`RPC ${name} error: ${error.message}`);
  return data;
}

export async function triggerReport(clientId) {
  const { data, error } = await supabase.functions.invoke(
    "generate-monthly-report",
    { body: { client_id: clientId } }
  );
  if (error) throw new Error(`Report trigger error: ${error.message}`);
  return data;
}

export async function fetchCeoOverview() {
  const { data, error } = await supabaseHQ
    .from("ceo_overview")
    .select("*")
    .single();
  if (error) throw new Error(`ceo_overview fetch error: ${error.message}`);
  return data;
}

export async function fetchCeoTrend() {
  const { data, error } = await supabase
    .from("ceo_monthly_trend")
    .select("*")
    .order("month", { ascending: true })
    .limit(6);
  if (error) throw new Error(`ceo_monthly_trend fetch error: ${error.message}`);
  return data;
}

export async function fetchClientPerformance() {
  const { data, error } = await supabase
    .from("ceo_client_performance")
    .select("*");
  if (error)
    throw new Error(`ceo_client_performance fetch error: ${error.message}`);
  return data;
}

export async function fetchAlerts(limit = 20) {
  const { data, error } = await supabase
    .from("n8n_error_logs")
    .select(
      "id,config_cliente_id,workflow_name,error_message,created_at,status,config_clientes(nome_negocio)"
    )
    .eq("status", "unresolved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`n8n_error_logs fetch error: ${error.message}`);
  return data;
}

// --- Phase 5: Per-client fetch functions ---

export async function fetchClientConfig(clientId) {
  const { data, error } = await supabase
    .from("config_clientes")
    .select("*")
    .eq("id", clientId)
    .single();
  if (error)
    throw new Error(`config_clientes fetch error: ${error.message}`);
  return data;
}

export async function fetchClientConversations(clientId, limit = 20) {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id,customer_phone,customer_name,outcome,messages_count,first_message,started_at,ended_at"
    )
    .eq("config_cliente_id", clientId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error)
    throw new Error(`conversations fetch error: ${error.message}`);
  return data;
}

export async function fetchClientMetricsDetail(clientId) {
  const { data, error } = await supabase
    .from("recuperai_monthly_metrics")
    .select("*")
    .eq("client_id", clientId)
    .order("month", { ascending: true })
    .limit(6);
  if (error)
    throw new Error(`recuperai_monthly_metrics fetch error: ${error.message}`);
  return data;
}

export async function fetchClientServices(clientId) {
  const { data, error } = await supabase
    .from("servicos")
    .select("*")
    .eq("config_cliente_id", clientId)
    .order("nome_servico");
  if (error) throw new Error(`servicos fetch error: ${error.message}`);
  return data;
}

export async function fetchClientSchedule(clientId) {
  const { data, error } = await supabase
    .from("horarios_funcionamento")
    .select("*")
    .eq("config_cliente_id", clientId)
    .order("dia_semana");
  if (error)
    throw new Error(`horarios_funcionamento fetch error: ${error.message}`);
  return data;
}

export async function fetchClientClosedDates(clientId) {
  const { data, error } = await supabase
    .from("datas_fechadas")
    .select("*")
    .eq("config_cliente_id", clientId)
    .order("data_inicio", { ascending: false });
  if (error)
    throw new Error(`datas_fechadas fetch error: ${error.message}`);
  return data;
}

// --- Phase 5: Mutation functions ---

export async function updateService(id, updates) {
  const { data, error } = await supabase
    .from("servicos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`servicos update error: ${error.message}`);
  return data;
}

export async function updateScheduleDay(id, updates) {
  const { data, error } = await supabase
    .from("horarios_funcionamento")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error)
    throw new Error(`horarios_funcionamento update error: ${error.message}`);
  return data;
}

export async function createClosedDate(data) {
  const { data: result, error } = await supabase
    .from("datas_fechadas")
    .insert(data)
    .select()
    .single();
  if (error)
    throw new Error(`datas_fechadas insert error: ${error.message}`);
  return result;
}

export async function deleteClosedDate(id) {
  const { error } = await supabase
    .from("datas_fechadas")
    .delete()
    .eq("id", id);
  if (error)
    throw new Error(`datas_fechadas delete error: ${error.message}`);
}
