import { fmtMonth } from "./formatters";

/**
 * Filter metrics by period (number of months from latest).
 * @param {Array} metrics
 * @param {number|null} months - null means "all"
 */
export function filterByPeriod(metrics, months) {
  if (!months) return metrics;
  const allMonths = [...new Set(metrics.map((m) => m.month))].sort();
  const cutoff = allMonths.slice(-months);
  return metrics.filter((m) => cutoff.includes(m.month));
}

/**
 * Compute KPI totals from a set of metrics.
 */
export function computeTotals(filtered) {
  const sortedMonths = [...new Set(filtered.map((m) => m.month))].sort();
  const latestMonth = sortedMonths.at(-1) ?? null;
  const prevMonth = sortedMonths.length >= 2 ? sortedMonths.at(-2) : null;

  const latest = filtered.filter((m) => m.month === latestMonth);
  const prev =
    prevMonth && prevMonth !== latestMonth
      ? filtered.filter((m) => m.month === prevMonth)
      : [];

  const sum = (arr, key) =>
    arr.reduce((a, b) => a + Number(b[key] || 0), 0);

  const totalRecovered = sum(latest, "total_recovered_value");
  const totalInvestment = sum(latest, "service_investment");
  const totalConversations = sum(latest, "total_conversations");
  const totalConverted = sum(latest, "converted_conversations");
  const totalCancelled = sum(latest, "cancelled_conversations");
  const profit = totalRecovered - totalInvestment;
  const roi =
    totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  const convRate =
    totalConversations > 0
      ? (totalConverted / totalConversations) * 100
      : 0;
  const avgTicket =
    totalConverted > 0 ? totalRecovered / totalConverted : 0;

  // New fields
  const botPercentage = sum(latest, "bot_percentage") / (latest.length || 1);
  const tempoEconomizado = sum(latest, "tempo_economizado_min");

  const prevRecovered = sum(prev, "total_recovered_value");
  const prevConversations = sum(prev, "total_conversations");
  const trendRecovered =
    prevRecovered > 0
      ? ((totalRecovered - prevRecovered) / prevRecovered) * 100
      : undefined;
  const trendConversations =
    prevConversations > 0
      ? ((totalConversations - prevConversations) / prevConversations) * 100
      : undefined;

  return {
    totalRecovered,
    totalInvestment,
    totalConversations,
    totalConverted,
    totalCancelled,
    profit,
    roi,
    convRate,
    avgTicket,
    botPercentage,
    tempoEconomizado,
    latestMonth,
    trendRecovered,
    trendConversations,
  };
}

/**
 * Build chart data from metrics.
 */
export function computeChartData(filtered) {
  const months = [...new Set(filtered.map((m) => m.month))].sort();
  return months.map((month) => {
    const rows = filtered.filter((m) => m.month === month);
    const sum = (key) => rows.reduce((a, b) => a + Number(b[key] || 0), 0);
    return {
      month: fmtMonth(month),
      receita: sum("total_recovered_value"),
      investimento: sum("service_investment"),
      lucro: sum("total_recovered_value") - sum("service_investment"),
      atendimentos: sum("total_conversations"),
      conversoes: sum("converted_conversations"),
    };
  });
}
