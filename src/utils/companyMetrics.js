/**
 * Aggregate company-level KPIs from clients and metrics.
 */
export function computeCompanyKpis(clients, metrics) {
  const activeClients = clients.filter((c) => c.status === "ativo");
  const mrr = activeClients.reduce(
    (sum, c) => sum + Number(c.investimento_mensal || 0),
    0
  );

  const months = [...new Set(metrics.map((m) => m.month))].sort();
  const latestMonth = months.at(-1) ?? null;
  const prevMonth = months.length >= 2 ? months.at(-2) : null;

  const latest = latestMonth
    ? metrics.filter((m) => m.month === latestMonth)
    : [];
  const prev =
    prevMonth && prevMonth !== latestMonth
      ? metrics.filter((m) => m.month === prevMonth)
      : [];

  const sum = (arr, key) =>
    arr.reduce((a, b) => a + Number(b[key] || 0), 0);

  const receitaTotal = sum(latest, "total_recovered_value");
  const prevReceita = sum(prev, "total_recovered_value");
  const trendReceita =
    prevReceita > 0
      ? ((receitaTotal - prevReceita) / prevReceita) * 100
      : undefined;

  // LTV medio = total recovered all time / active clients count
  const totalAllTime = sum(metrics, "total_recovered_value");
  const ltvMedio =
    activeClients.length > 0 ? totalAllTime / activeClients.length : 0;

  return {
    mrr,
    activeClients: activeClients.length,
    receitaTotal,
    ltvMedio,
    latestMonth,
    trendReceita,
  };
}

/**
 * Per-client summary for overview cards.
 */
export function computeClientSummary(client, metrics) {
  const clientMetrics = metrics.filter((m) => m.client_id === client.id);
  const months = [...new Set(clientMetrics.map((m) => m.month))].sort();
  const latestMonth = months.at(-1) ?? null;

  const latest = latestMonth
    ? clientMetrics.filter((m) => m.month === latestMonth)
    : [];
  const receita = latest.reduce(
    (sum, m) => sum + Number(m.total_recovered_value || 0),
    0
  );

  // Sparkline data (last 6 months)
  const recentMonths = months.slice(-6);
  const sparkline = recentMonths.map((month) => {
    const rows = clientMetrics.filter((m) => m.month === month);
    return {
      v: rows.reduce((s, r) => s + Number(r.total_recovered_value || 0), 0),
    };
  });

  return {
    ...client,
    receita,
    latestMonth,
    sparkline,
  };
}

/**
 * Monthly trend data for company-level chart.
 */
export function computeCompanyTrend(metrics) {
  const months = [...new Set(metrics.map((m) => m.month))].sort();
  return months.map((month) => {
    const rows = metrics.filter((m) => m.month === month);
    const sum = (key) => rows.reduce((a, b) => a + Number(b[key] || 0), 0);
    return {
      month,
      receita: sum("total_recovered_value"),
      investimento: sum("service_investment"),
      lucro: sum("total_recovered_value") - sum("service_investment"),
    };
  });
}
