const MONTH_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const NUMERIC_METRIC_FIELDS = [
  "total_conversations",
  "converted_conversations",
  "cancelled_conversations",
  "total_recovered_value",
  "service_investment",
  "profit",
  "roi_percent",
  "conversion_rate",
  "avg_ticket",
];

function isValidClient(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id !== "undefined" &&
    typeof item.name === "string" &&
    item.name.trim() !== ""
  );
}

function isValidMetric(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id !== "undefined" &&
    typeof item.client_id !== "undefined" &&
    typeof item.month === "string" &&
    MONTH_REGEX.test(item.month)
  );
}

function normalizeMetric(item) {
  const normalized = { ...item };
  for (const field of NUMERIC_METRIC_FIELDS) {
    normalized[field] = Number(item[field] || 0);
  }
  return normalized;
}

export function validateClients(data) {
  if (!Array.isArray(data)) {
    console.warn("[dataValidation] fetchClients retornou não-array:", data);
    return [];
  }
  const valid = data.filter(isValidClient);
  if (valid.length !== data.length) {
    console.warn(
      `[dataValidation] ${data.length - valid.length} cliente(s) inválido(s) descartado(s).`
    );
  }
  return valid;
}

export function validateMetrics(data) {
  if (!Array.isArray(data)) {
    console.warn("[dataValidation] fetchMetrics retornou não-array:", data);
    return [];
  }
  const valid = data.filter(isValidMetric).map(normalizeMetric);
  if (valid.length !== data.length) {
    console.warn(
      `[dataValidation] ${data.length - valid.length} métrica(s) inválida(s) descartada(s).`
    );
  }
  return valid;
}
