import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "../utils/colors";
import { fmt, fmtInt, fmtMonth } from "../utils/formatters";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { MetricCard } from "./MetricCard";
import { ClientSelector } from "./ClientSelector";
import { ClientTable } from "./ClientTable";
import { LoadingSkeleton } from "./LoadingSkeleton";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export default function RecuperAIDashboard() {
  const { clients, metrics, loading, error, reload } = useDashboardData();
  const [selectedClient, setSelectedClient] = useState("all");

  useAutoRefresh(reload, REFRESH_INTERVAL_MS);

  const filtered = useMemo(() => {
    if (selectedClient === "all") return metrics;
    return metrics.filter((m) => m.client_id === selectedClient);
  }, [metrics, selectedClient]);

  const totals = useMemo(() => {
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
      latestMonth,
      trendRecovered,
      trendConversations,
    };
  }, [filtered]);

  const chartData = useMemo(() => {
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
  }, [filtered]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          padding: 40,
        }}
      >
        <div
          style={{
            background: COLORS.card,
            padding: 32,
            borderRadius: 16,
            border: `1px solid ${COLORS.red}33`,
            maxWidth: 500,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔌</div>
          <h2 style={{ margin: "0 0 10px", color: COLORS.red }}>
            Erro ao carregar dados
          </h2>
          <p style={{ color: COLORS.textMuted, margin: "0 0 20px", fontSize: 13 }}>
            {error}
          </p>
          <button
            onClick={reload}
            style={{
              background: COLORS.accentDim,
              color: COLORS.accent,
              border: `1px solid ${COLORS.accent}44`,
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.5s ease both; }
        .fade-in-1 { animation-delay: 0.05s; }
        .fade-in-2 { animation-delay: 0.1s; }
        .fade-in-3 { animation-delay: 0.15s; }
        .fade-in-4 { animation-delay: 0.2s; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "24px 32px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.bg,
            }}
          >
            R
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              RecuperAI
              <span
                style={{
                  color: COLORS.textMuted,
                  fontWeight: 400,
                  fontSize: 14,
                  marginLeft: 8,
                }}
              >
                Dashboard
              </span>
            </h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 12,
              color: COLORS.textMuted,
              background: COLORS.card,
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {clients.filter((c) => c.status === "active").length} clientes ativos
          </span>
          <span
            style={{
              fontSize: 12,
              color: COLORS.accent,
              background: COLORS.accentDim,
              padding: "6px 14px",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            ● Ao vivo
          </span>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Client Filter */}
        <div className="fade-in" style={{ marginBottom: 24 }}>
          <ClientSelector
            clients={clients}
            selected={selectedClient}
            onSelect={setSelectedClient}
          />
        </div>

        {/* KPI Cards */}
        <div
          className="fade-in fade-in-1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <MetricCard
            icon="💰"
            label="Receita Recuperada"
            prefix="R$"
            value={fmt(totals.totalRecovered)}
            color={COLORS.accent}
            sublabel={totals.latestMonth ? fmtMonth(totals.latestMonth) : "—"}
            trend={totals.trendRecovered}
          />
          <MetricCard
            icon="📊"
            label="Investimento"
            prefix="R$"
            value={fmt(totals.totalInvestment)}
            color={COLORS.orange}
            sublabel="Custo do serviço"
          />
          <MetricCard
            icon="🚀"
            label="Lucro Gerado"
            prefix="R$"
            value={fmt(totals.profit)}
            color={COLORS.accent}
            sublabel="Receita − Investimento"
          />
          <MetricCard
            icon="⚡"
            label="ROI"
            value={fmtInt(totals.roi)}
            suffix="%"
            color={totals.roi >= 500 ? COLORS.accent : COLORS.orange}
            sublabel="Retorno sobre investimento"
          />
          <MetricCard
            icon="💬"
            label="Atendimentos"
            value={fmtInt(totals.totalConversations)}
            color={COLORS.blue}
            sublabel="Total de conversas"
            trend={totals.trendConversations}
          />
          <MetricCard
            icon="✅"
            label="Conversões"
            value={fmtInt(totals.totalConverted)}
            color={COLORS.accent}
            sublabel={`Taxa: ${totals.convRate.toFixed(1)}%`}
          />
          <MetricCard
            icon="🎫"
            label="Ticket Médio"
            prefix="R$"
            value={fmt(totals.avgTicket)}
            color={COLORS.purple}
            sublabel="Valor médio por recuperação"
          />
          <MetricCard
            icon="❌"
            label="Cancelamentos"
            value={fmtInt(totals.totalCancelled)}
            color={COLORS.red}
            sublabel="Leads cancelados"
          />
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div
            className="fade-in fade-in-2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "20px 22px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.textMuted,
                }}
              >
                💰 Receita vs Investimento
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={COLORS.border}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: COLORS.textMuted, fontSize: 11 }}
                    axisLine={{ stroke: COLORS.border }}
                  />
                  <YAxis
                    tick={{ fill: COLORS.textMuted, fontSize: 11 }}
                    axisLine={{ stroke: COLORS.border }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 10,
                      fontSize: 12,
                      color: COLORS.text,
                    }}
                    formatter={(value) => [`R$ ${fmt(value)}`]}
                  />
                  <Bar
                    dataKey="receita"
                    name="Receita"
                    fill={COLORS.accent}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="investimento"
                    name="Investimento"
                    fill={COLORS.orange}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "20px 22px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.textMuted,
                }}
              >
                📈 Atendimentos vs Conversões
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={COLORS.border}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: COLORS.textMuted, fontSize: 11 }}
                    axisLine={{ stroke: COLORS.border }}
                  />
                  <YAxis
                    tick={{ fill: COLORS.textMuted, fontSize: 11 }}
                    axisLine={{ stroke: COLORS.border }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 10,
                      fontSize: 12,
                      color: COLORS.text,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="atendimentos"
                    name="Atendimentos"
                    stroke={COLORS.blue}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS.blue, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversoes"
                    name="Conversões"
                    stroke={COLORS.accent}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS.accent, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ROI Highlight Block */}
        <div
          className="fade-in fade-in-3"
          style={{
            background: `linear-gradient(135deg, ${COLORS.accentGlow}, ${COLORS.card})`,
            border: `1px solid ${COLORS.accent}33`,
            borderRadius: 16,
            padding: "28px 32px",
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            textAlign: "center",
          }}
        >
          {[
            {
              label: "Investimento",
              value: `R$ ${fmt(totals.totalInvestment)}`,
              color: COLORS.orange,
            },
            {
              label: "Receita Recuperada",
              value: `R$ ${fmt(totals.totalRecovered)}`,
              color: COLORS.accent,
            },
            {
              label: "Lucro Gerado",
              value: `R$ ${fmt(totals.profit)}`,
              color: COLORS.accent,
            },
            {
              label: "ROI",
              value: `${fmtInt(totals.roi)}%`,
              color: COLORS.accent,
            },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Client Table — usa `filtered` (bug fix) */}
        <div className="fade-in fade-in-4">
          <ClientTable metrics={filtered} clients={clients} />
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "32px 0 16px",
            fontSize: 11,
            color: COLORS.textDim,
            letterSpacing: "0.05em",
          }}
        >
          RecuperAI Dashboard • Dados em tempo real via Supabase • Uso interno
        </div>
      </div>
    </div>
  );
}
